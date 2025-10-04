"use ref";

import Checkbox from "@/components/checkbox";
import { WorkstreamType } from "@/data_display/data-type";

interface WorkstreamTableProps {
    workstreams: WorkstreamType[];
    onClickWorkstream?: (workstream: WorkstreamType | null) => void;
    selectedIds?: number[];
    setSelectedIds?: React.Dispatch<React.SetStateAction<number[]>>;
    selectedId?: number | null;
    setSelectedId?: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function WorkstreamTable({
    workstreams,
    onClickWorkstream,
    selectedIds,
    setSelectedIds,
    selectedId,
    setSelectedId,
}: WorkstreamTableProps) {
    // Toggle single row
    const toggleRow = (id: number) => {
        if (setSelectedIds && selectedIds)
            setSelectedIds?.((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            );
        if (setSelectedId && selectedId)
            setSelectedId((prev) => (prev == id ? null : id));
    };

    // Toggle all rows
    const toggleAll = () => {
        if (!setSelectedIds || !selectedIds) return;
        if (selectedIds.length === workstreams.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(workstreams.map((row) => row.id as number));
        }
    };

    const selectable = (selectedIds && setSelectedIds) || setSelectedId;

    return (
        <div className="pb-6 animate-fadeIn">
            {/* Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden lg:min-w-3xl">
                <table className="w-full text-left">
                    <thead className="bg-white/20">
                        <tr>
                            {selectable && (
                                <th className="w-12 p-3 text-center align-middle">
                                    <Checkbox
                                        id="check_all"
                                        checked={
                                            !!selectedIds &&
                                            !!setSelectedIds &&
                                            selectedIds.length > 0 &&
                                            selectedIds.length ===
                                                workstreams.length
                                        }
                                        onChange={toggleAll}
                                    />
                                </th>
                            )}
                            <th className="p-4 max-w-[150px] whitespace-nowrap">
                                S/N
                            </th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Use Case</th>
                            <th className="p-4">Date Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workstreams.map((workstreams, i) => (
                            <tr
                                key={workstreams.id}
                                onClick={() => {
                                    if (onClickWorkstream)
                                        onClickWorkstream(workstreams);
                                }}
                                className="cursor-pointer hover:bg-white/20 transition"
                            >
                                {selectable && (
                                    <td className="p-3 text-center align-middle">
                                        <Checkbox
                                            id={workstreams.id?.toString()}
                                            checked={
                                                selectedIds
                                                    ? selectedIds.includes(
                                                          workstreams.id as number
                                                      )
                                                    : selectedId ==
                                                      workstreams.id
                                            }
                                            onChange={() =>
                                                toggleRow(
                                                    workstreams.id as number
                                                )
                                            }
                                        />
                                    </td>
                                )}
                                <td className="p-4 max-w-md truncate">
                                    {i + 1}
                                </td>
                                <td className="p-4 max-w-md truncate">
                                    {workstreams.title}
                                </td>
                                <td className="p-4 max-w-md truncate">
                                    {workstreams.use_case}
                                </td>
                                <td className="p-4 max-w-md truncate">
                                    {workstreams.create_date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {workstreams.length === 0 && (
                    <div className="px-4 py-2 text-stone-300 w-full italic text-center">
                        No entry
                    </div>
                )}
            </div>
        </div>
    );
}
