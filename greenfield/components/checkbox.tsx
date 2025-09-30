"use client";
import Icon from "./icon/icon";
import { sizeStyleOptions } from "./size-box";

interface CheckboxProps {
    id?: string;
    checked: boolean;
    onChange: () => void;
    size?: sizeStyleOptions;
}

export default function Checkbox({ checked, onChange, id }: CheckboxProps) {
    return (
        <label
            htmlFor={id}
            className="flex h-5 w-5 items-center justify-center cursor-pointer"
            onClick={(e) => e.stopPropagation()}
        >
            {/* The real input, visually hidden but still accessible */}
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                    e.stopPropagation(); // 👈 prevents row click
                    onChange();
                }}
                className="sr-only"
            />

            {/* Custom styled box */}
            <div
                className={`flex h-5 w-5 items-center justify-center rounded-md bg-stone-200 hover:bg-stone-300`}
            >
                {checked && (
                    <Icon
                        name="check"
                        color="fuchsia"
                        className="stroke-3 p-0.5"
                        size="sm"
                    />
                )}
            </div>
        </label>
    );
}
