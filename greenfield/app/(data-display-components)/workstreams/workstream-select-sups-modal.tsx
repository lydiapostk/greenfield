"use client";
import PopupModal from "@/components/popup-modal";
import { useEffect, useMemo, useState } from "react";
import {
    StartupReadType,
    WorkstreamReadType,
    WorkstreamType,
} from "@/data_display/data-type";
import { getUpdateWSFunction } from "../utils";
import { useRouter } from "next/navigation";
import StartupTable from "../startups/startup-table";
import Icon from "@/components/icon/icon";

interface WorkstreamSelectSupsModalProps {
    workstream: WorkstreamReadType;
    setIsLoading: (isLoading: boolean) => void;
    setIsModalOpen: (isOpen: boolean) => void;
    onSuccess?: (ws: WorkstreamReadType) => void;
}

export default function WorkstreamSelectSupsModal({
    workstream,
    setIsLoading,
    setIsModalOpen,
    onSuccess = () => {},
}: WorkstreamSelectSupsModalProps) {
    const [startups, setStartups] = useState<StartupReadType[]>([]);
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/startups/`)
            .then((res) =>
                res.json().then((data: StartupReadType[]) => {
                    setStartups(data);
                    setIsLoading(false);
                })
            )
            .catch(() => setIsLoading(false));
    }, []);

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
    const router = useRouter();
    const insertStartupsToWS = () => {
        if (selectedIds.length == 0) return;
        getUpdateWSFunction({
            workstream_id: workstream.id,
            setError: setError,
            onSuccess: onSuccess,
        })("startup_ids", selectedIds);
    };

    return (
        <PopupModal
            onClose={() => {
                setIsModalOpen(false);
                setError("");
            }}
            onConfirm={insertStartupsToWS}
        >
            <div className="text-black">
                <h1 className="text-xl font-semibold">Select workstream</h1>
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
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            setIsModalOpen(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            insertStartupsToWS();
                            setError("");
                        }}
                        className={`px-4 py-2 rounded-lg bg-violet-800/65 text-white ${
                            !!selectedIds
                                ? "hover:bg-violet-800/85 cursor-pointer"
                                : ""
                        }`}
                        disabled={!selectedIds}
                    >
                        Add {selectedIds.length} startups
                    </button>
                </div>
            </div>
        </PopupModal>
    );
}
