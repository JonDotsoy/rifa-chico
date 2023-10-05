import { type FC } from "react"
import classNames from "classnames"

const privacyPhoneNumber = (value: string) => {
    const v = value.replace(/[^\d]/gm, '')
    return `***${v.substring(v.length - 5)}`
}

interface Prop {
    total: number
    values?: { item: { id: string }, phone: { number: string } }[]
}

export const GridSelect: FC<Prop> = ({ total = 1, values = [] }) => {
    return <>
        <input type="hidden" name="raffle_numbers" value={total} />
        <div className="
            flex
            flex-wrap
            justify-center
        ">
            {Array(total).fill(0).map((_, index) => {
                const key = `raffle_number_${index}`
                const check = values.find(v => v.item.id === key)

                return <div key={index} className={classNames({
                    'opacity-50': !!check
                })}>
                    <input
                        className="hidden peer"
                        type="checkbox"
                        name={`raffle_number`}
                        value={index}
                        id={key}
                        checked={!!check}
                        disabled={!!check} />
                    <label key={index} htmlFor={key}

                        className={classNames(`
                            border
                            w-24
                            h-16
                            py-2
                            flex
                            text-center
                            transition-all
                            justify-center
                            align-middle
                            overflow-hidden
                            flex-col
                        `, {
                            'peer-checked:bg-green-400 peer-checked:text-white': !check,
                            'peer-checked:bg-gray-500 peer-checked:text-gray-200': !!check,
                        })}
                    >
                        <span>{index + 1}</span>
                        {check && <span className="text-sm -rotate-6 -translate-y-2 bg-green-400">{privacyPhoneNumber(check.phone.number)}</span>}
                    </label>
                </div>
            }
            )}
        </div>
    </>
}