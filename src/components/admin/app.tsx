import { useEffect, type FC, useState, type FormEvent, type PropsWithChildren, useRef, Fragment, useId } from "react";
import useSWR from "swr"
import { app } from "../../lib/firebase"
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, updateCurrentUser, type User } from "firebase/auth"
import { collection, getDocs, getFirestore, setDoc, doc, updateDoc } from "firebase/firestore"
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

    const push = async ({ id, phone }: { id: string, phone: string, }) => {
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
                    createdAt: new Date(),
                })
        } catch (ex) {
            setError(ex);
            console.error(ex);
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

const usePushNoteRaffle = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const push = async ({ id, note }: { id: string, note: string, }) => {
        setIsLoading(true)
        try {
            await updateDoc(
                doc(collection(firestore, 'raffles'), id)
                , {
                    note,
                    updatedAt: new Date(),
                })
        } catch (ex) {
            setError(ex);
            console.error(ex);
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

const UpdateNote: FC<{ raffleId: string, noteDefault }> = ({ raffleId, noteDefault }) => {
    const id = useId()
    const form = useRef<HTMLFormElement | null>()
    const [editionActive, setEditionActive] = useState(false)
    const { isLoading, push } = usePushNoteRaffle()

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (form.current) {
            const formData = new FormData(form.current)

            const noteValue = formData.get('note').toString()

            push({ id: raffleId, note: noteValue })
        }
    }

    return <>
        <span className="max-md:col-span-3 md:col-span-1 md:flex md:justify-end">
            <button onClick={() => setEditionActive(e => !e)} className="bg-blue-400 text-white px-3 rounded shadow transition focus:shadow-sm focus:bg-blue-300">Editar Nota</button>
        </span>
        {editionActive && <>
            <div className="col-span-3 p-4 bg-gray-100 shadow-inner">
                <form ref={form} onSubmit={onSubmit}>
                    <label className="block pb-2" htmlFor={id}>Notas:</label>
                    <textarea name="note" id={id} defaultValue={noteDefault} className="block w-full p-4 border shadow rounded" placeholder="Tus notas aquí" rows={10}></textarea>
                    <div className="pt-2">
                        <button type="submit" disabled={isLoading} className="bg-green-400 text-white px-3 rounded shadow-md focus:shadow-sm transition disabled:bg-gray-300 disabled:shadow-none disabled:text-gray-200">Guardar</button>
                        {isLoading && <span className="text-sm text-gray-500"> Cargando...</span>}
                    </div>
                </form>
            </div>
        </>}
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
                            <div className="border rounded transition hover:shadow grid [&>span]:p-2 md:[&>span]:p-4">
                                {raffles?.map(raffle => (
                                    <Fragment key={raffle.item.id}>
                                        <span className="max-md:col-span-3">Ticket: {raffle.item.id.substring(14)}</span>
                                        <span className="max-md:col-span-3"><a href={`https://wa.me/56${raffle.phone.number}`} target="_blank">+56 {raffle.phone.number}</a></span>
                                        <UpdateNote raffleId={raffle.item.id} noteDefault={raffle.note}></UpdateNote>
                                        <span className="col-span-3 border-t mx-4"></span>
                                    </Fragment>
                                ))}
                            </div>
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