"use client";

import { useEffect, useState } from "react";
import SideDrawer from "@/components/side_drawer";
import Icon from "@/components/icon/icon";
import ConfirmModal from "@/components/confirm-modal";
import {
    WorkstreamCreateDisplayType,
    WorkstreamType,
} from "@/data_display/data-type";
import { deleteFromDB } from "@/data_display/utils";
import WorkstreamTable from "@/workstreams/workstream-table";
import DeleteButton from "../components/delete-button";
import CreateButton from "../components/create-button";
import { useRouter } from "next/navigation";
import WorkstreamPreview from "@/workstreams/workstream-preview";
import WorkstreamCreateModal from "@/workstreams/workstream-create-modal";

export default function BrowseWorkstreams() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
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

    // Sidebar controls
    const [selectedWorkstream, setSelectedWorkstream] =
        useState<WorkstreamType | null>(null);

    // Table controls
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Delete Modal
    const [isDelModalOpen, setIsDelModalOpen] = useState<boolean>(false);
    const [delError, setDelError] = useState<string>("");
    const onDelWorkstreams = (workstreamIDsToDel: number[]) => {
        deleteFromDB({
            type: "workstreams",
            idsToDel: workstreamIDsToDel,
            setIsLoading: setIsLoading,
            setIsDelModalOpen: setIsDelModalOpen,
            setError: setDelError,
            onSuccess: () => {
                setSelectedIds([]);
                setSelectedWorkstream(null);
                setWorkstreams(
                    workstreams.filter(
                        (workstream) =>
                            !workstreamIDsToDel.includes(
                                workstream.id as number
                            )
                    )
                );
            },
        });
    };

    // CREATE MODAL
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    return (
        <div className="flex flex-col justify-start w-full h-full text-white">
            <h1 className="text-xl font-bold mt-12 self-center ">
                Workstreams
            </h1>
            {/* Delete Modal */}
            {isDelModalOpen && (
                <ConfirmModal
                    confirmText={`Delete (${
                        selectedWorkstream ? 1 : selectedIds.length
                    })`}
                    onClose={() => setIsDelModalOpen(false)}
                    onConfirm={() =>
                        selectedWorkstream
                            ? onDelWorkstreams([
                                  selectedWorkstream.id as number,
                              ])
                            : onDelWorkstreams(selectedIds)
                    }
                    error={delError}
                />
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <WorkstreamCreateModal
                    setIsLoading={setIsLoading}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    onSuccess={(data: WorkstreamType) => {
                        setSelectedWorkstream(null);
                        setWorkstreams([...workstreams, data]);
                    }}
                />
            )}
            {/* Spinning Modal */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <Icon name={"spinner"} color="blue" size={"lg"} />
                </div>
            )}
            <div className="self-center lg:w-3/5">
                {/* Table tools */}
                <div className="flex flex-row justify-start items-center py-2">
                    <CreateButton
                        onClick={() => setIsCreateModalOpen(true)}
                        showText={true}
                        createText={`Create workstream`}
                        disabled={!!selectedWorkstream}
                    />
                    <DeleteButton
                        onClick={() => setIsDelModalOpen(true)}
                        showText={true}
                        deleteText={`Delete (${selectedIds.length})`}
                        disabled={
                            selectedIds.length == 0 || !!selectedWorkstream
                        }
                    />
                </div>
                {/* Table */}
                <WorkstreamTable
                    workstreams={workstreams}
                    onClickWorkstream={setSelectedWorkstream}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                />
            </div>
            {selectedWorkstream && (
                <SideDrawer
                    onClose={() => {
                        setSelectedWorkstream(null);
                        setDelError("");
                    }}
                >
                    {/* Sidebar tools */}
                    <div className="flex flex-row w-full justify-between items-center mt-10">
                        <div className="flex flex-col w-full justify-start items-start">
                            <DeleteButton
                                onClick={() => setIsDelModalOpen(true)}
                                showText={true}
                            />
                            <WorkstreamPreview
                                workstream={selectedWorkstream}
                            />
                        </div>
                    </div>
                </SideDrawer>
            )}
        </div>
    );
}
