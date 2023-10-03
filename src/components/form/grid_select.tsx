import { type FC } from "react"

interface Prop {
    total: number
}

export const GridSelect: FC<Prop> = ({ total = 1 }) => {
    return <>
        <input type="hidden" name="raffle_numbers" value={total} />
        <div className="
            flex
            flex-wrap
            justify-center
        ">
            {Array(total).fill(0).map((_, index) =>
                <div>
                    <input className="hidden peer" type="checkbox" name={`raffle_number_${index}`} id={`raffle_number_${index}`} />
                    <label key={index} htmlFor={`raffle_number_${index}`}
                        className={`
                            border
                            w-16
                            py-2
                            block
                            text-center
                            transition-all
                            peer-checked:bg-gray-800
                            peer-checked:opacity-50
                            peer-checked:text-white
                        `}
                    >
                        {index + 1}
                    </label>
                </div>
            )}
        </div>
    </>
}