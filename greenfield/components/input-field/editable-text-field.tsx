"use client";

import { useState, useRef, useEffect } from "react";
import { InputFieldType } from "./input-types";
import Icon from "../icon/icon";
import { StartupType } from "@/app/(with-navbar)/(startup-display-components)/startup-data-type";

interface EditableFieldProps extends InputFieldType<string> {
    onSave: (field: keyof StartupType, value: string) => void;
    label: string;
    field_key: keyof StartupType;
    value: string;
    multiline?: boolean;
    fontStyle?: string;
    showLabel?: boolean;
}

export default function EditableTextField({
    onSave,
    label,
    field_key,
    value,
    fontStyle = "",
    disabled = false,
    multiline = false,
    showLabel = true,
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
            onSave(field_key, draft);
        }
    };

    const cancelChange = () => {
        setDraft(value); // reset to original
        inputRef.current?.blur();
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col space-y-1 w-full">
            {showLabel && <label className="font-bold">{label}</label>}

            {/* Read Mode */}
            {!isEditing && (
                <p
                    className={`p-2 rounded w-full ${
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
                            className={`p-2 rounded border min-w-full min-h-[100px] ${fontStyle}`}
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
                            className={`p-2 rounded border w-full ${fontStyle}`}
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
