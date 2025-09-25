"use client";

import Icon from "../icon/icon";
import { InputFieldType } from "./input-types";

interface InputTextFieldProp extends InputFieldType<string> {}

export default function TextInputField({
    setValue,
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
        <div className="flex flex-col gap-3 justify-center h-full w-full">
            {error && error !== "" && (
                <div className="flex flex-row items-center justify-start gap-3 font-mono text-stone-200">
                    <Icon
                        name={"error"}
                        className="stroke-stone-200"
                        strokeWidth={2}
                        size="md"
                    />
                    {error}
                </div>
            )}
            <div
                className={`flex flex-row bg-stone-200 rounded-md p-2 transition delay-100 duration-300 shadow-xl shadow-slate-500/70 hover:shadow-slate-500/25 active:shadow-slate-500/25 items-center justify-stretch
                ${className ?? ""}`}
            >
                {leftIcon}
                <input
                    type="text"
                    onChange={handleChange}
                    className={`focus:outline-none active:outline-none text-left w-full disabled:text-gray-500 disabled:cursor-not-allowed placeholder:text-gray-700`}
                    {...props}
                />
                {rightIcon}
            </div>
        </div>
    );
}
