"use client";

import { useEffect, useState } from "react";
import Icon from "../icon/icon";

interface EditableListFieldProps<T> {
    field_key: T;
    label: string;
    value: string[];
    onSave: (field: T, value: string[]) => void;
    disabled?: boolean;
    showLabel?: boolean;
    checkData?: (entry: string, setError: (error: string) => void) => boolean;
}

export default function EditableListField<T>({
    field_key,
    label,
    value,
    onSave,
    disabled = false,
    showLabel = true,
    checkData,
}: EditableListFieldProps<T>) {
    const [error, setError] = useState<string | null>(null);
    const [entries, setEntries] = useState<string[]>(value);
    const [isEditing, setIsEditing] = useState(false);

    const handleAdd = () => {
        setEntries([...entries, ""]);
    };

    const handleDelete = (index: number) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
    };

    const handleChange = (index: number, newValue: string) => {
        const updated = [...entries];
        updated[index] = newValue;
        setEntries(updated);
    };

    const commitChange = async () => {
        setError("");

        // validate before saving
        for (const entry of entries) {
            if (entry.trim().length === 0) {
                setError("Invalid entries: key is required.");
                return;
            }
            if (checkData) {
                const ok = await checkData(entry, setError);
                if (!ok) return; // error already set
            }
        }
        const isValid = entries.every(
            (entry) =>
                entry.trim().length > 0 &&
                (!checkData || checkData(entry, setError))
        );
        onSave(field_key, entries);
        setIsEditing(false);
    };

    const cancelChange = () => {
        setEntries(value); // reset
        setError("");
        setIsEditing(false);
    };

    // cancel change on escape
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") cancelChange();
        };
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [value]);

    // commit change on enter
    useEffect(() => {
        const handleEnterKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") commitChange();
        };
        document.addEventListener("keydown", handleEnterKey);
        return () => {
            document.removeEventListener("keydown", handleEnterKey);
        };
    }, [commitChange]);

    return (
        <div className="flex flex-col w-full gap-2">
            {showLabel && <span className="font-bold">{label}</span>}
            {error && error !== "" && (
                <div className="flex flex-row items-center justify-start gap-2 font-mono italic text-stone-600">
                    <Icon
                        name={"error"}
                        className=""
                        strokeWidth={2}
                        size="sm"
                    />
                    {error}
                </div>
            )}
            {/* Read Mode */}
            {!isEditing && (
                <ul
                    className={`rounded ${
                        disabled ? "cursor-not-allowed text-gray-500" : ""
                    }`}
                    onClick={() => !disabled && setIsEditing(true)}
                >
                    {entries.length === 0 && (
                        <p className="italic text-gray-500">No entries</p>
                    )}
                    {entries.map((entry, i) => (
                        <ol
                            key={i}
                            className={`truncate pb-2 max-w-full text-wrap ${
                                disabled
                                    ? ""
                                    : "hover:bg-stone-300 cursor-pointer"
                            }`}
                        >
                            {i + 1}. {entry}
                        </ol>
                    ))}
                </ul>
            )}

            {/* Edit Mode */}
            {isEditing && (
                <div className="flex flex-col gap-2">
                    {entries.map((entry, i) => (
                        <div
                            key={i}
                            className="flex flex-row gap-2 items-center w-full min-h-fit text-wrap"
                        >
                            <p className="w-[20px]">{i + 1}.</p>
                            <textarea
                                value={entry}
                                onChange={(e) =>
                                    handleChange(i, e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") commitChange();
                                    if (e.key === "Escape") cancelChange();
                                }}
                                className="rounded border px-1 flex-1 text-wrap h-fit w-2/3 bg-stone-100 custom-scroll"
                            />
                            <Icon
                                name="delete"
                                size="sm"
                                className="hover:stroke-[2] transition ease-in-out cursor-pointer"
                                onClick={() => handleDelete(i)}
                            />
                        </div>
                    ))}

                    <div className="flex flex-row justify-between items-center">
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="text-indigo-600 text-sm pl-1 cursor-pointer hover:underline self-start"
                        >
                            + Add entry
                        </button>
                        <div className="flex flex-row justify-end items-center gap-2">
                            <Icon
                                name="cross"
                                size="md"
                                className="hover:stroke-[2] transition ease-in-out cursor-pointer"
                                onClick={cancelChange}
                            />
                            <Icon
                                name="tick"
                                size="md"
                                className="hover:stroke-[2] transition ease-in-out cursor-pointer"
                                onClick={commitChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
