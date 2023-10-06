import { Fragment, type FC } from "react"
import classNames from "classnames"

interface Prop {
    total: number
    values?: { item: { id: string }, phone: { number: string } }[]
    since?: number
}

export const GridSelectPaper: FC<Prop> = ({ total = 1, values = [], since }) => {
    return <>
        <input type="hidden" name="raffle_numbers" value={total} />
        <div className="
            grid
            grid-cols-[auto_1fr_2fr]
            [&>div]:border
        ">
            <div className="p-2 font-bold">Numero</div>
            <div className="p-2 font-bold">Teléfono</div>
            <div className="p-2 font-bold">Nombre</div>
            {Array(total).fill(0).map((_, index) => {
                const key = `raffle_number_${index}`
                const check = values.find(v => v.item.id === key)

                return <Fragment key={index}>
                    <div className="text-center p-4">
                        <span>{index + 1 + since}</span>
                    </div>
                    <div></div>
                    <div></div>
                </Fragment>
            }
            )}
        </div>
    </>
}