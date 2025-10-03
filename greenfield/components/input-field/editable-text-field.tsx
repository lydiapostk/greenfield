"use client";

import { useState, useRef, useEffect } from "react";
import { InputFieldType } from "./input-types";
import Icon from "../icon/icon";

interface EditableFieldProps<T> extends InputFieldType<string> {
    onSave: (field: T, value: string) => void;
    label: string;
    field_key: T;
    value?: string;
    multiline?: boolean;
    fontStyle?: string;
    showLabel?: boolean;
    textAreaSize?: "sm" | "md" | "lg" | number;
    placeholder?: string;
}

export default function EditableTextField<T>({
    onSave,
    label,
    field_key,
    value = "",
    fontStyle = "",
    disabled = false,
    multiline = false,
    showLabel = true,
    textAreaSize = "md",
    placeholder = "Please fill in...",
}: EditableFieldProps<T>) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<string>(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
        null
    );

    // Focus input when switching to edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
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

    const textAreaSizeStyle = (() => {
        switch (textAreaSize) {
            case "sm":
                return "min-h-24";
            case "md":
                return "min-h-40";
            case "lg":
                return "min-h-52";
            default:
                return `min-h-[${textAreaSize}px]`;
        }
    })();

    return (
        <div
            className={`${
                multiline ? "flex flex-col" : "flex flex-row"
            } justify-start w-full gap-2 mb-0`}
        >
            {showLabel && <span className="font-bold min-w-fit">{label}</span>}

            {/* Read Mode */}
            {!isEditing && (
                <p
                    className={`rounded w-fit max-w-full text-wrap ${
                        !disabled && value !== ""
                            ? " hover:bg-stone-300 cursor-pointer"
                            : `text-gray-500 ${
                                  disabled ? "cursor-not-allowed" : "italic"
                              }`
                    } ${fontStyle} `}
                    onClick={() => !disabled && setIsEditing(true)}
                >
                    {value == "" ? placeholder : value}
                </p>
            )}

            {/* Edit Mode */}
            {isEditing && (
                <div className="flex flex-col gap-2">
                    {multiline ? (
                        <textarea
                            ref={
                                inputRef as React.RefObject<HTMLTextAreaElement>
                            }
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commitChange();
                                if (e.key === "Escape") cancelChange();
                            }}
                            className={`rounded border min-w-full ${textAreaSizeStyle} bg-stone-100 px-1 ${fontStyle} text-wrap`}
                            placeholder={placeholder}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commitChange();
                                if (e.key === "Escape") cancelChange();
                            }}
                            className={`rounded border w-fit bg-stone-100/75 px-1 ${fontStyle}`}
                            placeholder={placeholder}
                        />
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
