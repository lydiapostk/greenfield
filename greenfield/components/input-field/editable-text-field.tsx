"use client";

import { useState, useRef, useEffect } from "react";
import { InputFieldType } from "./input-types";
import { useClickOutside } from "./use-click-outside";
import Icon from "../icon/icon";

interface EditableFieldProps extends InputFieldType<string> {
    onSave: (field: string, value: string) => void;
    label: string;
    value: string;
    multiline?: boolean;
}

export default function EditableTextField({
    onSave,
    label,
    value,
    disabled = false,
    multiline = false,
}: EditableFieldProps) {
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
        setIsEditing(false);
        if (draft !== value) {
            onSave(label, draft);
        }
    };

    const cancelChange = () => {
        setDraft(value); // reset to original
        inputRef.current?.blur();
        setIsEditing(false);
    };

    // cancel if clicking outside of the input
    useClickOutside(inputRef, cancelChange);

    return (
        <div className="flex flex-col space-y-1 w-full">
            <label className="font-bold">{label}</label>

            {/* Read Mode */}
            {!isEditing && (
                <p
                    className={`p-2 rounded w-full ${
                        disabled
                            ? "cursor-not-allowed text-gray-500"
                            : " hover:bg-stone-300 cursor-pointer"
                    }`}
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
                            onBlur={commitChange}
                            className="p-2 rounded border min-w-full min-h-[100px]"
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commitChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commitChange();
                                if (e.key === "Escape") cancelChange();
                            }}
                            className="p-2 rounded border w-full"
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
