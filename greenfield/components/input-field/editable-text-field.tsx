"use client";

import { useState, useRef, useEffect } from "react";
import { InputFieldType } from "./input-types";
import Icon from "../icon/icon";

interface EditableFieldProps<T> extends InputFieldType<string> {
    onSave: (field: T, value: string) => void;
    label: string;
    field_key: T;
    value: string;
    multiline?: boolean;
    fontStyle?: string;
    showLabel?: boolean;
}

export default function EditableTextField<T>({
    onSave,
    label,
    field_key,
    value,
    fontStyle = "",
    disabled = false,
    multiline = false,
    showLabel = true,
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

    return (
        <div
            className={`${
                multiline ? "flex flex-col" : "flex flex-row"
            } justify-start w-full gap-2`}
        >
            {showLabel && <span className="font-bold min-w-fit">{label}</span>}

            {/* Read Mode */}
            {!isEditing && (
                <p
                    className={`rounded w-fit ${
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
                <div className="flex flex-col gap-2">
                    {multiline ? (
                        <textarea
                            ref={
                                inputRef as React.RefObject<HTMLTextAreaElement>
                            }
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className={`rounded border min-w-full min-h-[100px] ${fontStyle}`}
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
                            className={`rounded border w-fit ${fontStyle}`}
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
