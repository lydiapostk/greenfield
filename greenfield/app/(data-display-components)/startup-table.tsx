"use ref";

import Checkbox from "@/components/checkbox";
import { StartupReadType, StartupType } from "./data-type";

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
    // Toggle single row
    const toggleRow = (id: number) => {
        setSelectedIds?.((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Toggle all rows
    const toggleAll = () => {
        if (!setSelectedIds || !selectedIds) return;
        if (selectedIds.length === startups.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(startups.map((row) => row.id as number));
        }
    };

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
                                        id="check_all"
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
                    {startups.length === 0 ? (
                        <caption className="px-4 py-2 text-stone-200 w-full italic">
                            No results
                        </caption>
                    ) : (
                        <tbody>
                            {startups.map((startup, i) => (
                                <tr
                                    key={i}
                                    onClick={() => {
                                        if (onClickStartup)
                                            onClickStartup(startup);
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
                                                    toggleRow(
                                                        startup.id as number
                                                    )
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
                                            ? Object.keys(
                                                  startup.founders
                                              ).join(", ")
                                            : "Unknown"}
                                    </td>
                                    <td className="p-4 max-w-md truncate">
                                        {startup.company_website}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}
