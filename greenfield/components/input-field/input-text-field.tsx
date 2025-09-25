"use client";

import { InputFieldType } from "./input-types";

interface InputTextFieldProp extends InputFieldType<string> {}

export default function TextInputField({
    setValue,
    disabled,
    leftIcon,
    rightIcon,
    className,
    error,
    ...props
}: InputTextFieldProp) {
    const handleChange = setValue
        ? (event: React.ChangeEvent<HTMLInputElement>) => {
              setValue(event.target.value);
          }
        : undefined;

    return (
        <div
            className={`flex flex-row bg-stone-200 rounded-md p-2 ${
                error ? "border-red-500" : "border-gray-300"
            } transition delay-100 duration-300 shadow-xl shadow-slate-500/70 hover:shadow-slate-500/25 active:shadow-slate-500/25 items-center justify-stretch
          ${className ?? ""}`}
        >
            {leftIcon}
            <input
                type="text"
                onChange={handleChange}
                className={`focus:outline-none active:outline-none text-left w-full placeholder:text-gray-700`}
                {...props}
            />
            {rightIcon}
        </div>
    );
}
