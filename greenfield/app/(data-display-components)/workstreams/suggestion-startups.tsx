"use client";

import IconButton from "@/components/icon-button";
import Icon from "@/components/icon/icon";
import { useState } from "react";
import { StartupReadType, WorkstreamReadType } from "../data-type";
import { getUpdateWSFunction } from "../utils";
import StartupTable from "../startups/startup-table";

interface SuggestionStartupsProps {
    workstream: WorkstreamReadType;
    startups: StartupReadType[];
    onApply: (ws: WorkstreamReadType) => void;
}

export default function SuggestionStartups({
    workstream,
    startups,
    onApply,
}: SuggestionStartupsProps) {
    const [error, setError] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
                <StartupTable
                    key={`workstream-${workstream.id}-suggestions`}
                    startups={startups}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onClickStartup={(sup) => {
                        if (!sup) return;
                        setSelectedIds((prev) =>
                            prev.includes(sup.id)
                                ? prev.filter((id) => id !== sup.id)
                                : [...prev, sup.id]
                        );
                    }}
                />
                <IconButton
                    onClick={handleApplyClick}
                    text={`Apply Suggestion (${selectedIds.length})`}
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
