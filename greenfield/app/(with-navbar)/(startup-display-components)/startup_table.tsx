"use ref";

import { useMemo, useState } from "react";
import { StartupType } from "./startup-data-type";

interface StartupTableProp {
    startups: StartupType[];
    onClickStartup?: (startup: StartupType | null) => void;
}

export default function StartupTable({
    startups,
    onClickStartup: setSelectedStartup,
}: StartupTableProp) {
    const [search, setSearch] = useState<string>("");
    // Filter list if searching
    const filteredValues = useMemo(() => {
        console.log(search);
        return startups.filter((startup) =>
            startup.company_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [startups, search]);

    return (
        <div className="pb-6 animate-fadeIn">
            <input
                id="table_search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full z-20 px-4 py-2 my-6 rounded-2xl bg-white/10 focus:outline-none focus:ring-0 focus:bg-white/20"
                autoFocus
            />
            {/* Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden lg:min-w-3xl">
                <table className="w-full text-left">
                    <thead className="bg-white/20">
                        <tr>
                            <th className="p-4 max-w-[150px] whitespace-nowrap">
                                S/N
                            </th>
                            <th className="p-4">Company Name</th>
                            <th className="p-4">Founders</th>
                            <th className="p-4">Company Website</th>
                        </tr>
                    </thead>
                    {filteredValues.length === 0 ? (
                        <caption className="px-4 py-2 text-stone-200 w-full italic">
                            No results
                        </caption>
                    ) : (
                        <tbody>
                            {filteredValues.map((startup, i) => (
                                <tr
                                    key={startup.id}
                                    onClick={() => {
                                        if (setSelectedStartup)
                                            setSelectedStartup(startup);
                                    }}
                                    className="cursor-pointer hover:bg-white/20 transition"
                                >
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
