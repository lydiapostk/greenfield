"use client";

import IconButton from "@/components/icon-button";
import Icon from "@/components/icon/icon";
import { useMemo, useState } from "react";
import { StartupReadType, WorkstreamReadType } from "../data-type";
import { getUpdateWSFunction } from "../utils";
import StartupTable from "../startups/startup-table";

interface SuggestionStartupsProps {
    workstream: WorkstreamReadType;
    startups: StartupReadType[];
    onApply: (ws: WorkstreamReadType) => void;
    onCancel?: () => void;
}

export default function SuggestionStartups({
    workstream,
    startups,
    onApply,
    onCancel = () => {},
}: SuggestionStartupsProps) {
    const [error, setError] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState<string>("");
    const workstreamCurrSupIDs = workstream.evaluations.map(
        (evaluation) => evaluation.startup.id
    );
    const filteredValues = useMemo(() => {
        return startups.filter(
            (sup) =>
                sup.company_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) &&
                !workstreamCurrSupIDs.includes(sup.id)
        );
    }, [startups, search]);

    // Insert selected startups to selected workstream
    const insertStartupsToWS = () => {
        if (selectedIds.length == 0) return;
        getUpdateWSFunction({
            workstream_id: workstream.id,
            setError: setError,
            onSuccess: (ws: WorkstreamReadType) => {
                onApply(ws);
                setSelectedIds([]);
            },
        })("startup_ids", selectedIds);
    };

    const handleApplyClick = () => {
        insertStartupsToWS();
    };
    return (
        <div className="w-full space-y-3">
            <div className="rounded-lg border border-dashed border-blue-300 bg-violet-50 p-3 flex flex-col text-sm text-slate-600 gap-2">
                <div className="inline-flex font-medium items-center gap-2">
                    <Icon name={"lightBulb"} />
                    <span className="">Suggestion:</span>
                </div>
                <h1 className="text-xl font-semibold">Select start-ups</h1>
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
                <input
                    id="table_search"
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-4/5 px-4 py-2 my-2 self-center rounded-2xl bg-white/90 focus:outline-none focus:ring-0 focus:bg-white/70"
                    autoFocus
                />
                <StartupTable
                    startups={filteredValues}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onClickStartup={(sup: StartupReadType | null) => {
                        if (!sup) return;
                        const updatedSelectedIds = [...selectedIds];
                        if (updatedSelectedIds.includes(sup.id)) {
                            updatedSelectedIds.filter((id) => id != sup.id);
                        } else {
                            updatedSelectedIds.push(sup.id);
                        }
                        setSelectedIds(updatedSelectedIds);
                    }}
                />
                <IconButton
                    onClick={handleApplyClick}
                    text={`Apply Suggestion ${selectedIds.length}`}
                    iconName={"tick"}
                    showText={true}
                    showIcon={false}
                    className="bg-indigo-300 hover:bg-indigo-200 text-slate-800 mb-0"
                    iconClassName="stroke-slate-800"
                />
            </div>
        </div>
    );
}
