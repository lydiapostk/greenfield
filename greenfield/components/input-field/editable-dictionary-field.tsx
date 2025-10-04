"use client";

import { useState } from "react";
import Icon from "../icon/icon";
import { DictionaryEntry, EditableCustomFieldType } from "./types";

interface EditableDictionaryFieldProps<V>
    extends EditableCustomFieldType<DictionaryEntry[], V> {
    checkData?: (
        entry: DictionaryEntry,
        setError: (error: string) => void
    ) => Promise<boolean> | boolean;
}

export default function EditableDictionaryField<V>({
    field_key,
    label,
    value = [],
    onSave,
    disabled = false,
    showLabel = true,
    checkData,
}: EditableDictionaryFieldProps<V>) {
    const [error, setError] = useState<string | null>(null);
    const [entries, setEntries] = useState<DictionaryEntry[]>(value);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = () => {
        setEntries([...entries, { key: "", value: "" }]);
    };

    const handleDelete = (index: number) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
    };

    const handleChange = (
        index: number,
        field: "key" | "value",
        newValue: string
    ) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: newValue };
        setEntries(updated);
    };

    const commitChange = async () => {
        setIsLoading(true);
        setError("");

        // validate before saving
        for (const entry of entries) {
            if (entry.key.trim().length === 0) {
                setError("Invalid entries: key is required.");
                setIsLoading(false);
                return;
            }
            if (checkData) {
                const ok = await checkData(entry, setError);
                if (!ok) {
                    setIsLoading(false);
                    return; // error already set
                }
            }
        }
        onSave(field_key, entries, setIsEditing);
        setIsLoading(false);
    };

    const cancelChange = () => {
        setEntries(value); // reset
        setError("");
        setIsEditing(false);
    };

    function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Enter") {
            commitChange();
            e.stopPropagation();
        }
        if (e.key === "Escape") {
            cancelChange();
            e.stopPropagation();
        }
    }

    return (
        <div className="flex flex-col w-full gap-2" onKeyDown={onKeyDown}>
            {isLoading && (
                <div className="self-center my-6">
                    <Icon
                        name="spinner"
                        size="lg"
                        color="blue"
                        style={{ pointerEvents: "none" }}
                        className={`text-stone-200 fill-indigo-600 `}
                    />
                </div>
            )}
            {showLabel && <span className="font-bold">{label}</span>}
            {error && error !== "" && (
                <div className="flex flex-row items-center justify-start gap-2 font-mono italic text-red-700">
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
            {!isEditing && !isLoading && (
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
                        <ol key={i} className={`truncate flex flex-col pb-2`}>
                            <p
                                className={`max-w-full text-wrap ${
                                    disabled
                                        ? ""
                                        : "hover:bg-stone-300 cursor-pointer"
                                }`}
                            >
                                {i + 1}. {entry.key}
                            </p>
                            <p
                                className={`text-blue-600 max-w-full h-fit text-wrap font-mono ${
                                    disabled
                                        ? ""
                                        : "hover:bg-stone-300 cursor-pointer"
                                }`}
                            >
                                {entry.value || "No references."}
                            </p>
                        </ol>
                    ))}
                </ul>
            )}

            {/* Edit Mode */}
            {isEditing && !isLoading && (
                <div className="flex flex-col gap-2">
                    {entries.map((entry, i) => (
                        <div
                            key={i}
                            className="flex flex-row gap-2 items-center w-full min-h-fit text-wrap"
                        >
                            <p className="w-[20px]">{i + 1}.</p>
                            <textarea
                                placeholder="key (required)"
                                value={entry.key}
                                onChange={(e) =>
                                    handleChange(i, "key", e.target.value)
                                }
                                className="rounded border px-1 flex-1 text-wrap h-fit w-2/3 bg-stone-100 custom-scroll"
                            />
                            <textarea
                                placeholder="https://example.com (optional)"
                                value={entry.value || ""}
                                onChange={(e) =>
                                    handleChange(i, "value", e.target.value)
                                }
                                className="rounded border px-1 flex-1 bg-stone-100 custom-scroll"
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
