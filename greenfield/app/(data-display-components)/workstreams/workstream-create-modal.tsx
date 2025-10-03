"use client";
import PopupModal from "@/components/popup-modal";
import { useState } from "react";
import {
    StartupReadType,
    WorkstreamCreateDisplayType,
    WorkstreamType,
} from "@/data_display/data-type";
import WorkstreamCreateForm from "./workstream-create-form";

interface WorkstreamCreateModalProps {
    setIsLoading: (isLoading: boolean) => void;
    setIsCreateModalOpen: (isOpen: boolean) => void;
    onSuccess?: (ws: WorkstreamType) => void;
    startups?: StartupReadType[];
}

export default function WorkstreamCreateModal({
    setIsLoading,
    setIsCreateModalOpen,
    onSuccess = () => {},
    startups = [],
}: WorkstreamCreateModalProps) {
    // CREATE MODAL
    const [createError, setCreateError] = useState<string>("");
    const [newWs, setNewWs] = useState<WorkstreamCreateDisplayType>({
        title: "Untitled",
        startups: startups,
    });
    const onCreateWorkstream = () => {
        setIsLoading(true);
        setIsCreateModalOpen(false);
        setCreateError("");
        const { startups, ...updateWithoutStartups } = newWs;
        updateWithoutStartups["startup_ids"] = startups.map(
            (startup) => startup.id
        );
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/workstreams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateWithoutStartups),
        })
            .then((res) =>
                res.json().then((data: WorkstreamType) => {
                    if (!res.ok) {
                        setIsCreateModalOpen(true);
                        setCreateError(res.statusText);
                    } else {
                        // Reset
                        setNewWs({
                            title: "Untitled",
                            startups: [],
                        });
                        onSuccess(data);
                    }
                })
            )
            .catch((e: unknown) => {
                setIsCreateModalOpen(true);
                if (e instanceof Error) {
                    setCreateError(e.message);
                } else {
                    setCreateError("Unexpected error");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    return (
        <PopupModal
            onClose={() => {
                setIsCreateModalOpen(false);
                setCreateError("");
            }}
            onConfirm={onCreateWorkstream}
        >
            <div className="text-black">
                <h1 className="text-xl font-semibold">Create workstream</h1>

                <WorkstreamCreateForm
                    workstream={newWs}
                    updateWorkstream={setNewWs}
                    error={createError}
                />
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            setIsCreateModalOpen(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onCreateWorkstream();
                            setCreateError("");
                        }}
                        className="px-4 py-2 rounded-lg bg-violet-800/65 text-white hover:bg-violet-800/85 cursor-pointer"
                    >
                        Create
                    </button>
                </div>
            </div>
        </PopupModal>
    );
}
