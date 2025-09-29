"use client";

import { useState, useRef, useEffect } from "react";
import { InputFieldType } from "./input-types";
import Icon from "../icon/icon";

interface EditableFieldProps<T> extends InputFieldType<string> {
    onSave: (field: T, value: string) => void;
    label: string;
    field_key: T;
    value?: string;
    values: string[];
    fontStyle?: string;
    showLabel?: boolean;
}

export default function EditableDropdownField<T>({
    onSave,
    label,
    field_key,
    value,
    values,
    fontStyle = "",
    disabled = false,
    showLabel = true,
}: EditableFieldProps<T>) {
    if (!value) value = values[0];
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState<string>(value);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const selectedRef = useRef<HTMLLIElement | null>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            setIsOpen(true); // open dropdown
        }
        if (!isEditing) {
            setIsOpen(false);
        }
    }, [isEditing]);

    const commitChange = () => {
        inputRef.current?.blur();
        if (draft !== value) {
            onSave(field_key, draft);
        }
        setTimeout(() => {
            setIsEditing(false); // delay exit edit mode, to give db time to update and display new value
        }, 100);
    };

    const cancelChange = () => {
        setDraft(value); // reset to original
        inputRef.current?.blur();
        setIsEditing(false);
    };

    // close on outside click, stay in edit mode
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // cancel change on escape and commit change on enter
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") cancelChange();
        };
        const handleEnterKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") commitChange();
        };
        document.addEventListener("keydown", handleEscapeKey);
        document.addEventListener("keydown", handleEnterKey);
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.removeEventListener("keydown", handleEnterKey);
        };
    }, []);

    // scroll to selected year when opening
    useEffect(() => {
        if (isOpen && selectedRef.current) {
            selectedRef.current.scrollIntoView({ block: "nearest" });
        }
    }, [isOpen]);

    return (
        <div className={`flex flex-row justify-start w-full gap-2`}>
            {showLabel && <span className="font-bold min-w-fit">{label}</span>}

            {/* Read Mode */}
            {!isEditing && (
                <p
                    className={`rounded min-w-2/5 w-fit ${
                        disabled
                            ? "cursor-not-allowed text-gray-500"
                            : " hover:bg-stone-300 cursor-pointer"
                    } ${fontStyle} `}
                    onClick={() => !disabled && setIsEditing(true)}
                >
                    {value}
                </p>
            )}

            {/* Edit Mode */}
            {isEditing && (
                <div className="flex flex-col min-w-2/5" ref={inputRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="rounded border w-full bg-stone-100 px-1 text-left flex justify-between items-center cursor-pointer hover:border-indigo-600 focus:border-indigo-900"
                    >
                        <span className={``}>{draft}</span>
                        <span
                            className={`ml-2 transform transition-transform ${
                                isOpen ? "rotate-180" : ""
                            }`}
                        >
                            ▼
                        </span>
                    </button>

                    {/* Dropdown list */}
                    {isOpen && (
                        <div className="relative w-full">
                            <ul className="absolute z-10 max-h-48 w-full overflow-y-auto bg-white border rounded shadow-lg custom-scroll">
                                {values.map((val) => (
                                    <li
                                        key={val}
                                        ref={val === draft ? selectedRef : null}
                                        onClick={() => {
                                            setDraft(val);
                                            setIsOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer w-full hover:bg-indigo-100/50 ${
                                            val === draft
                                                ? "bg-indigo-100 font-bold"
                                                : ""
                                        }`}
                                    >
                                        {val}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-row justify-end items-center gap-1">
                        <Icon
                            name={"cross"}
                            size={"md"}
                            className="hover:stroke-[2] transition ease-in-out delay-100 duration-300"
                            onClick={cancelChange}
                        />
                        <Icon
                            name={"tick"}
                            size={"md"}
                            className="hover:stroke-[2] transition ease-in-out delay-100 duration-300"
                            onClick={commitChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
