import { type FC, useRef } from "react";

interface Props {
    id: string
    name: string
    type: string
    placeholder: string
    autoComplete: string
    pattern?: string
    required: boolean
}

export const Input: FC<Props> = ({ name,
    id,
    type,
    placeholder,
    autoComplete,
    required,
    pattern
}) => {
    const inputRef = useRef<null | HTMLInputElement>(null)


    return <>
        <input
            id={id}
            ref={inputRef}
            name={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            pattern={pattern}
        />
    </>
}