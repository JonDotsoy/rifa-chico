import { useEffect, type FC, useState, type FormEvent } from "react";
import useSWR from "swr"
import { app } from "../../lib/firebase"
import { getAuth, GoogleAuthProvider, signInWithRedirect, updateCurrentUser, type User } from "firebase/auth"
import { collection, getDocs, getFirestore, setDoc, doc } from "firebase/firestore"
import classNames from "classnames";

const auth = getAuth(app)
const firestore = getFirestore(app)

const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    useEffect(() => {
        const unsubscribeOnAuthStateChanged = auth.onAuthStateChanged(setCurrentUser)

        return () => {
            unsubscribeOnAuthStateChanged()
        }
    }, [])

    return {
        user: currentUser,
    }
}

const listRaffles = async () => {
    const docs = await getDocs(collection(firestore, 'raffles'))

    return docs.docs.map(d => d.data())
}

const usePushRaffle = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const push = async ({ id, phone }: { id: string, phone: string }) => {
        setIsLoading(true)
        try {
            await setDoc(
                doc(collection(firestore, 'raffles'), id)
                , {
                    item: {
                        id,
                    },
                    phone: {
                        number: phone,
                    },
                })
        } catch (ex) {

        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        push
    }
}

export const App: FC = () => {
    const { isLoading: isLoadingPushRaffle, push: pushRaffle } = usePushRaffle()
    const { user } = useAuth()
    const {
        data: raffles,
        isLoading: isLoadingRaffles
    } = useSWR(user && ['listRaffles'], listRaffles)

    const signIn = () => {
        signInWithRedirect(auth, new GoogleAuthProvider())
    }

    const onMakeNumber = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const raffleNumber = Number(formData.get('raffle_number').toString()) - 1
        const phone = formData.get('phone').toString()

        pushRaffle({ id: `raffle_number_${raffleNumber}`, phone })
    }

    return <>
        <div className="container m-auto p-4">
            {!user && <>
                <button onClick={signIn} className="border px-4 py-2 rounded shadow bg-blue-500 text-white">Iniciar Session</button>
            </>}

            {user && <>
                <h1 className="text-2xl pb-4">Admin</h1>

                <div className="pb-4">
                    <h2>UID</h2>
                    <pre className="bg-gray-100 p-4"><code>{user?.uid}</code></pre>
                </div>

                <div className="pb-8">
                    <h1>Lista actual</h1>
                    <div className={classNames('text-gray-300 text-sm', { 'opacity-0': !isLoadingRaffles })}>Cargando...</div>
                    {!raffles && <><span className="text-gray-400">Sin numeros</span></>}
                    {raffles?.map(raffle => (
                        <div key={JSON.stringify(raffle)}>
                            <span>- {raffle.item.id}</span>
                        </div>
                    ))}
                </div>

                <div>
                    <form onSubmit={onMakeNumber} method="dialog" className="space-y-4">
                        <h2>Marcar numero</h2>
                        <div className="flex flex-col">
                            <label htmlFor="raffle_number">Numero</label>
                            <input required id="raffle_number" name="raffle_number" type="text" className="border rounded p-2" list="raffle_numbers_list" />
                            <datalist id="raffle_numbers_list">
                                {Array(100).fill(0).map((_, index) => (<option key={index} value={`${index + 1}`}>Numero {index + 1}</option>))}
                            </datalist>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="phone">Teléfono</label>
                            <input required id="phone" name="phone" type="tel" autoComplete="off" className="border rounded p-2" placeholder="123456789" />
                        </div>
                        <div>
                            <button disabled={isLoadingPushRaffle} type="submit" className="px-4 py-2 bg-green-500 text-white rounded shadow disabled:bg-gray-300 transition">Guardar</button>
                        </div>
                    </form>
                </div>
            </>}
        </div>
    </>
}