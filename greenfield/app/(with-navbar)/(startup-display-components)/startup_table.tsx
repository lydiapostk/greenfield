import { StartupType } from "./startup-data-type";

interface StartupTableProp {
    startups: StartupType[];
    setSelectedStartup: (startup: StartupType | null) => void;
}

export default function StartupTable({
    startups,
    setSelectedStartup,
}: StartupTableProp) {
    return (
        <div className="pb-6">
            {/* Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/20">
                        <tr>
                            <th className="p-4">Company Name</th>
                            <th className="p-4">Founders</th>
                            <th className="p-4">Company Website</th>
                        </tr>
                    </thead>
                    <tbody>
                        {startups.map((startup) => (
                            <tr
                                key={startup.id}
                                onClick={() => setSelectedStartup(startup)}
                                className="cursor-pointer hover:bg-white/20 transition"
                            >
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
            </div>
        </div>
    );
}
