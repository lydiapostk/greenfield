"use client";
import PopupModal from "@/components/popup-modal";
import { useEffect, useMemo, useState } from "react";
import { WorkstreamReadType, WorkstreamType } from "@/data_display/data-type";
import { getUpdateWSFunction } from "../utils";
import { useRouter } from "next/navigation";

interface WorkstreamSelectModalProps {
    setIsLoading: (isLoading: boolean) => void;
    isModalOpen: (isOpen: boolean) => void;
    startup_ids: number[];
    onSuccess?: (ws: WorkstreamReadType) => void;
}

export default function WorkstreamSelectModal({
    setIsLoading,
    isModalOpen,
    startup_ids = [],
    onSuccess = () => {},
}: WorkstreamSelectModalProps) {
    const [workstreams, setWorkstreams] = useState<WorkstreamType[]>([]);
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/workstreams/`)
            .then((res) =>
                res.json().then((data: WorkstreamType[]) => {
                    setWorkstreams(data);
                    setIsLoading(false);
                })
            )
            .catch(() => setIsLoading(false));
    }, []);

    const [error, setError] = useState<string>("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState<string>("");
    const filteredValues = useMemo(() => {
        return workstreams.filter((ws) =>
            ws.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [workstreams, search]);

    // Insert selected startups to selected workstream
    const router = useRouter();
    const insertStartupToWS = () => {
        if (!selectedId) return;
        getUpdateWSFunction({
            workstream_id: selectedId,
            setError: setError,
            onSuccess: onSuccess,
        })("startup_ids", startup_ids);
    };

    return (
        <PopupModal
            onClose={() => {
                isModalOpen(false);
                setError("");
            }}
            onConfirm={insertStartupToWS}
        >
            <div className="text-black">
                <h1 className="text-xl font-semibold">Select workstream</h1>
                {/* 
                <WorkstreamCreateForm
                    workstream={newWs}
                    updateWorkstream={setNewWs}
                    error={createError}
                /> */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            isModalOpen(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            insertStartupToWS();
                            setError("");
                        }}
                        className={`px-4 py-2 rounded-lg bg-violet-800/65 text-white ${
                            !!selectedId
                                ? "hover:bg-violet-800/85 cursor-pointer"
                                : ""
                        }`}
                        disabled={!!selectedId}
                    >
                        Add {startup_ids.length} startups
                    </button>
                </div>
            </div>
        </PopupModal>
    );
}
