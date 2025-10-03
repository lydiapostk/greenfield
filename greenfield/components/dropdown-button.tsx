"use client";

import Icon from "@/components/icon/icon";
import { useRef, useState } from "react";
import { useClickOutside } from "./input-field/use-click-outside";

interface DropdownButtonProps {
    options: {
        label: string;
        onClick: () => void;
    }[];
    text?: string;
    showIcon?: boolean;
    showText?: boolean;
    disabled?: boolean;
    className?: string;
    hideWhenDisabled?: boolean;
}

export default function DropdownButton({
    options,
    text = "Options",
    showIcon = true,
    showText = false,
    disabled = false,
    className = "",
    hideWhenDisabled = false,
}: DropdownButtonProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setOpen(false));

    return (
        <div className="relative inline-block text-left mb-6" ref={dropdownRef}>
            <div
                className={`inline-flex ${
                    open ? "bg-violet-600" : "bg-violet-800"
                } hover:bg-violet-700 rounded-2xl px-3 py-1.5
                        stroke-2 gap-1 transition ease-in
                        w-fit text-stone-200 font-medium ${
                            disabled && hideWhenDisabled
                                ? "cursor-default opacity-0"
                                : "cursor-pointer"
                        } ${className} my-0`}
                onClick={() => {
                    if (disabled) return;
                    setOpen((prev) => !prev);
                }}
            >
                {showIcon && (
                    <Icon
                        name={open ? "chevronUp" : "chevronDown"}
                        size="md"
                        className="stroke-stone-200 hover:stroke-[2]"
                    />
                )}
                {showText && text}
            </div>
            <div className="absolute z-50 rounded-2xl bg-indigo-300 flex flex-col justify-start w-full">
                {open &&
                    options.map((option) => (
                        <button
                            key={option.label}
                            onClick={() => {
                                setOpen(false);
                                option.onClick();
                            }}
                            className=" hover:bg-indigo-200 rounded-2xl w-full py-2 cursor-pointer"
                        >
                            {option.label}
                        </button>
                    ))}
            </div>
        </div>
    );
}
