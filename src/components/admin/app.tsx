import { useEffect, type FC, useState, type FormEvent, type PropsWithChildren, useRef } from "react";
import useSWR from "swr"
import { app } from "../../lib/firebase"
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, updateCurrentUser, type User } from "firebase/auth"
import { collection, getDocs, getFirestore, setDoc, doc } from "firebase/firestore"
import classNames from "classnames";
import styles from "./app.module.css";

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

type PositionDialog = {
    id: number,
    x: number,
    y: number,
    // ttl: number,
}

const ButtonClip: FC<PropsWithChildren<{ value: string }>> = ({ children, value }) => {
    const uniqueIdRef = useRef(0)
    const uniqueId = () => {
        uniqueIdRef.current = uniqueIdRef.current + 1
        return uniqueIdRef.current
    }
    const [positionDialogs, setPositionDialogs] = useState<PositionDialog[]>([])

    const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault()
        navigator?.clipboard?.writeText(value)
        const positionDialog: PositionDialog = {
            id: uniqueId(),
            x: event.clientX,
            y: event.clientY,
        }
        setPositionDialogs(e => [...e, positionDialog])
        setTimeout(() => {
            setPositionDialogs(e => e.filter(e => e !== positionDialog))
        }, 1000)
    }

    return <>
        <button onClick={onClick}>{children} 📋</button>
        {positionDialogs.map(({ id, x, y }) => <span
            key={id}
            style={{ '--pos-x': `${x}px`, '--pos-y': `${y}px` } as any}
            className={classNames(
                styles.moveUp,
                "absolute border rounded-md px-2 bg-white shadow-md translate-x-2 -translate-y-[100%] top-[var(--pos-y)] left-[var(--pos-x)]"
            )}
        >Copiado</span>)}
    </>
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

    const onSignOut = () => {
        signOut(auth)
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

                <div className="space-y-8">
                    <div className="pb-4 space-y-4 bg-gray-50 p-4 rounded shadow">
                        <h2 className="text-xl">Info Session</h2>
                        <dl className="[&>dt]:font-bold [&>dd]:ml-5">
                            <dt>UID</dt>
                            <dd><ButtonClip value={user.uid}>{user.uid}</ButtonClip></dd>
                        </dl>
                        <button onClick={onSignOut} className="px-2 rounded bg-blue-400 text-white shadow hover:shadow-md transition">Cerrar Session</button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded shadow">
                        <h2 className="text-xl">Lista actual de tickets</h2>
                        <div className={classNames('text-gray-300 text-sm', { 'opacity-0': !isLoadingRaffles })}>Cargando...</div>
                        {!raffles && <><span className="text-gray-400">Sin numeros</span></>}
                        <div>
                            {raffles?.map(raffle => (
                                <div key={JSON.stringify(raffle)} className="border rounded transition hover:shadow flex gap-2 [&>span]:p-4">
                                    <span className="border-r">Ticket: {raffle.item.id.substring(14)}</span>
                                    <span><a href={`tel:+56${raffle.phone.number}`}>+56 {raffle.phone.number}</a></span>
                                </div>
                            ))}
                        </div>
                    </div>


                    <form onSubmit={onMakeNumber} method="dialog" className="space-y-4 bg-gray-50 p-4 rounded shadow">
                        <h2 className="text-xl">Marcar numero manualmente</h2>
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
                            <button disabled={isLoadingPushRaffle} type="submit" className="px-4 py-2 bg-green-500 text-white rounded shadow hover:shadow-md disabled:bg-gray-300 transition">Guardar</button>
                        </div>
                    </form>

                </div>
            </>}
        </div>
    </>
}