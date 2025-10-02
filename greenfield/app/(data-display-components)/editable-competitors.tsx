"use client";

import Icon from "@/components/icon/icon";
import { useEffect, useState } from "react";
import { CompetitorsType } from "./startup-data-type";

export interface CompetitorEntry {
    name: string;
    description: string;
    url: string;
}

interface EditableCompetitorsFieldProps<T> {
    field_key: T;
    label: string;
    /** API model: Competitors */
    value: CompetitorsType;
    onSave: (field: T, values: CompetitorsType) => void;
    disabled?: boolean;
    showLabel?: boolean;
    checkData?: (
        entry: CompetitorEntry,
        setError: (error: string) => void
    ) => Promise<boolean> | boolean;
}

export default function EditableCompetitorsField<T>({
    field_key,
    label,
    value,
    onSave,
    disabled = false,
    showLabel = true,
    checkData,
}: EditableCompetitorsFieldProps<T>) {
    const toEntries = (
        data: { [key: string]: { description: string; url: string } }[]
    ): CompetitorEntry[] =>
        data.map((obj) => {
            const name = Object.keys(obj)[0];
            const info = obj[name];
            return { name, description: info.description, url: info.url };
        });

    const fromEntries = (entries: CompetitorEntry[]) =>
        entries.map((e) => ({
            [e.name]: { description: e.description, url: e.url },
        }));

    const [error, setError] = useState<string | null>(null);
    const [entries, setEntries] = useState<CompetitorEntry[]>(toEntries(value));
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = () => {
        setEntries([...entries, { name: "", description: "", url: "" }]);
    };

    const handleDelete = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleChange = (
        index: number,
        field: keyof CompetitorEntry,
        newValue: string
    ) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: newValue };
        setEntries(updated);
    };

    const commitChange = async () => {
        setIsLoading(true);
        setError("");

        for (const entry of entries) {
            if (!entry.name.trim()) {
                setError("Competitor name is required.");
                setIsLoading(false);
                return;
            }
            if (!entry.description.trim()) {
                setError("Description is required.");
                setIsLoading(false);
                return;
            }
            if (checkData) {
                const ok = await checkData(entry, setError);
                if (!ok) {
                    setIsLoading(false);
                    return;
                }
            }
        }

        onSave(field_key, fromEntries(entries));
        setIsEditing(false);
        setIsLoading(false);
    };

    const cancelChange = () => {
        setEntries(toEntries(value));
        setError("");
        setIsEditing(false);
    };

    // escape cancel
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") cancelChange();
        };
        document.addEventListener("keydown", handleEscapeKey);
        return () => document.removeEventListener("keydown", handleEscapeKey);
    }, [value]);

    // enter commit
    useEffect(() => {
        const handleEnterKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") commitChange();
        };
        document.addEventListener("keydown", handleEnterKey);
        return () => document.removeEventListener("keydown", handleEnterKey);
    }, [commitChange]);

    return (
        <div className="flex flex-col w-full gap-2">
            {isLoading && (
                <div className="self-center my-6">
                    <Icon
                        name="spinner"
                        size="lg"
                        color="blue"
                        className="text-stone-200 fill-indigo-600"
                    />
                </div>
            )}
            {showLabel && <span className="font-bold">{label}</span>}
            {error && error !== "" && (
                <div className="flex flex-row items-center gap-2 text-red-700">
                    <Icon name={"error"} size="sm" />
                    {error}
                </div>
            )}

            {/* Read Mode */}
            {!isEditing && !isLoading && (
                <ul
                    className={`${
                        disabled ? "cursor-not-allowed text-gray-500" : ""
                    }`}
                    onClick={() => !disabled && setIsEditing(true)}
                >
                    {entries.length === 0 && (
                        <p className="italic text-gray-500">No competitors</p>
                    )}
                    {entries.map((entry, i) => (
                        <li key={i} className="pb-3">
                            <p
                                className={`font-bold ${
                                    disabled
                                        ? ""
                                        : "hover:bg-stone-300 cursor-pointer"
                                }`}
                            >
                                {i + 1}. {entry.name}
                            </p>
                            <p
                                className={`italic ${
                                    disabled
                                        ? ""
                                        : "hover:bg-stone-300 cursor-pointer"
                                }`}
                            >
                                {entry.description}
                            </p>
                            {entry.url && (
                                <a
                                    href={entry.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline break-all"
                                >
                                    {entry.url}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Edit Mode */}
            {isEditing && !isLoading && (
                <div className="flex flex-col gap-2">
                    {entries.map((entry, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-2 p-2 border rounded bg-stone-50"
                        >
                            <div className="flex flex-row gap-2 items-center">
                                <p className="w-[20px]">{i + 1}.</p>
                                <input
                                    placeholder="Competitor name (required)"
                                    value={entry.name}
                                    onChange={(e) =>
                                        handleChange(i, "name", e.target.value)
                                    }
                                    className="border px-1 flex-1 bg-stone-100 rounded"
                                />
                                <Icon
                                    name="delete"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => handleDelete(i)}
                                />
                            </div>
                            <textarea
                                placeholder="Description (required)"
                                value={entry.description}
                                onChange={(e) =>
                                    handleChange(
                                        i,
                                        "description",
                                        e.target.value
                                    )
                                }
                                className="border px-1 w-full bg-stone-100 rounded"
                            />
                            <input
                                placeholder="https://example.com (optional)"
                                value={entry.url}
                                onChange={(e) =>
                                    handleChange(i, "url", e.target.value)
                                }
                                className="border px-1 w-full bg-stone-100 rounded"
                            />
                        </div>
                    ))}

                    <div className="flex flex-row justify-between items-center">
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="text-indigo-600 text-sm hover:underline"
                        >
                            + Add competitor
                        </button>
                        <div className="flex flex-row gap-2">
                            <Icon
                                name="cross"
                                size="md"
                                onClick={cancelChange}
                                className="cursor-pointer"
                            />
                            <Icon
                                name="tick"
                                size="md"
                                onClick={commitChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
