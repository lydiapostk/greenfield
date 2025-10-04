"use client";

import { useState, useRef, useEffect } from "react";
import { EditableInputFieldType } from "./types";
import Icon from "../icon/icon";

interface EditableFieldProps<V> extends EditableInputFieldType<string, V> {
    multiline?: boolean;
    textAreaSize?: "sm" | "md" | "lg" | number;
}

export default function EditableTextField<V>({
    onSave,
    label,
    labelStyle = "",
    field_key,
    value = "",
    valueStyle = "",
    disabled = false,
    multiline = false,
    showLabel = true,
    textAreaSize = "md",
    placeholder = "Please fill in...",
}: EditableFieldProps<V>) {
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
            onSave(field_key, draft, setIsEditing);
        }
    };

    const cancelChange = () => {
        setDraft(value); // reset to original
        inputRef.current?.blur();
        setIsEditing(false);
    };

    function onKeyDown(
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        if (e.key === "Enter") {
            commitChange();
            e.stopPropagation();
        }
        if (e.key === "Escape") {
            cancelChange();
            e.stopPropagation();
        }
    }

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
            {showLabel && (
                <span className={`font-bold min-w-fit ${labelStyle}`}>
                    {label}
                </span>
            )}

            {/* Read Mode */}
            {!isEditing && (
                <p
                    className={`rounded w-fit max-w-full text-wrap ${
                        !disabled && value !== ""
                            ? " hover:bg-stone-300 cursor-pointer"
                            : `text-gray-500 ${
                                  disabled ? "cursor-not-allowed" : "italic"
                              }`
                    } ${valueStyle} `}
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
                            onKeyDown={onKeyDown}
                            className={`rounded border min-w-full ${textAreaSizeStyle} bg-stone-100 px-1 ${valueStyle} text-wrap`}
                            placeholder={placeholder}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={onKeyDown}
                            className={`rounded border w-fit bg-stone-100/75 px-1 ${valueStyle}`}
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
