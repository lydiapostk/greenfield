"use ref";

import Checkbox from "@/components/checkbox";
import { StartupReadType, StartupType } from "@/data_display/data-type";
import { useCallback } from "react";

interface StartupTableProps<T extends StartupReadType | StartupType> {
    startups: T[];
    onClickStartup?: (startup: T | null) => void;
    selectedIds?: number[];
    setSelectedIds?: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function StartupTable<T extends StartupReadType | StartupType>({
    startups,
    onClickStartup,
    selectedIds,
    setSelectedIds,
}: StartupTableProps<T>) {
    const toggleRow = (id: number) => {
        setSelectedIds?.((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAll = useCallback(() => {
        if (!setSelectedIds || !selectedIds) return;
        setSelectedIds((prev) =>
            prev.length === startups.length
                ? []
                : startups.map((r) => r.id as number)
        );
    }, [setSelectedIds, startups]);

    return (
        <div className="pb-6 animate-fadeIn">
            {/* Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden lg:min-w-3xl">
                <table className="w-full text-left">
                    <thead className="bg-white/20">
                        <tr>
                            {selectedIds && setSelectedIds && (
                                <th className="w-12 p-3 text-center align-middle">
                                    <Checkbox
                                        id={`${startups
                                            .map((startup) => startup.id)
                                            .join("-")}-check-all`}
                                        checked={
                                            selectedIds.length > 0 &&
                                            selectedIds.length ===
                                                startups.length
                                        }
                                        onChange={toggleAll}
                                    />
                                </th>
                            )}
                            <th className="p-4 max-w-[150px] whitespace-nowrap">
                                S/N
                            </th>
                            <th className="p-4">Company Name</th>
                            <th className="p-4">Founders</th>
                            <th className="p-4">Company Website</th>
                        </tr>
                    </thead>
                    <tbody>
                        {startups.map((startup, i) => (
                            <tr
                                key={i}
                                onClick={() => {
                                    if (onClickStartup) onClickStartup(startup);
                                }}
                                className="cursor-pointer hover:bg-white/20 transition"
                            >
                                {selectedIds && setSelectedIds && (
                                    <td className="p-3 text-center align-middle">
                                        <Checkbox
                                            id={startup.id?.toString()}
                                            checked={selectedIds.includes(
                                                startup.id as number
                                            )}
                                            onChange={() =>
                                                toggleRow(startup.id as number)
                                            }
                                        />
                                    </td>
                                )}
                                <td className="p-4 max-w-md truncate">
                                    {i + 1}
                                </td>
                                <td className="p-4 max-w-md truncate">
                                    {startup.company_name}
                                </td>
                                <td className="p-4 max-w-xs truncate">
                                    {startup.founders
                                        ? Object.keys(startup.founders).join(
                                              ", "
                                          )
                                        : "Unknown"}
                                </td>
                                <td className="p-4 max-w-md truncate">
                                    {startup.company_website}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {startups.length === 0 && (
                    <div className="px-4 py-2 text-stone-300 w-full italic text-center">
                        No entry
                    </div>
                )}
            </div>
        </div>
    );
}
