"use client";

import { useEffect, useMemo, useState } from "react";
import SideDrawer from "@/components/side_drawer";
import Icon from "@/components/icon/icon";
import ConfirmModal from "@/components/confirm-modal";
import { WorkstreamType } from "@/data_display/data-type";
import WorkstreamTable from "@/data_display/workstream-table";
import PopupModal from "@/components/popup-modal";
import WorkstreamEditForm from "@/app/(data-display-components)/workstream-edit-form";
// import StartupView from "@/app/(data-display-components)/startup-view";
// import StartupEditForm from "@/data_display/startup-edit-form";

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
    const [inFullScreen, setInFullScreen] = useState<boolean>(false);
    const [selectedWorkstream, setSelectedWorkstream] =
        useState<WorkstreamType | null>(null);

    // Table controls
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Delete Modal
    const [isDelModalOpen, setIsDelModalOpen] = useState<boolean>(false);
    const [delError, setDelError] = useState<string>("");
    const onDelWorkstreams = (workstreamIDsToDel: number[]) => {
        setIsLoading(true);
        setIsDelModalOpen(false);
        setDelError("");
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/workstreams`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workstreamIDsToDel),
        })
            .then((res) =>
                res.json().then((data) => {
                    if (!res.ok || !data.ok) {
                        setIsDelModalOpen(true);
                        setDelError(
                            "Unexpected error during deletion occured!"
                        );
                    } else {
                        // Reset
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
                    }
                })
            )
            .catch((e: unknown) => {
                setIsDelModalOpen(true);
                if (e instanceof Error) {
                    setDelError(e.message);
                } else {
                    setDelError("Unexpected error");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="flex flex-col justify-start w-full h-full text-white">
            <h1 className="text-xl font-bold mt-12 self-center ">
                Workstreams
            </h1>

            {/* Delete Modal */}
            {isDelModalOpen && (
                <ConfirmModal
                    isOpen={true}
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
            {true && (
                <PopupModal
                    isOpen={true}
                    onClose={() => {}}
                    onConfirm={() => {}}
                >
                    <div className="text-black">
                        <h1 className="text-xl font-semibold">
                            Create workstream
                        </h1>

                        <WorkstreamEditForm />
                    </div>
                </PopupModal>
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
                    <div
                        className={`inline-flex bg-rose-600 rounded-2xl px-3 py-1.5 
                                hover:bg-rose-700 stroke-2 gap-1 transition ease-in
                                ${
                                    selectedIds.length > 0 &&
                                    !selectedWorkstream
                                        ? "cursor-pointer"
                                        : "cursor-default opacity-0"
                                }`}
                        onClick={() => {
                            if (selectedIds.length === 0) return;
                            setIsDelModalOpen(true);
                        }}
                    >
                        <Icon
                            name={"delete"}
                            color="white"
                            size={"sm"}
                            className="self-center"
                        />
                        Delete ({selectedIds.length})
                    </div>
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
                        setInFullScreen(false);
                    }}
                >
                    {/* Sidebar tools */}
                    <div className="flex flex-row w-full justify-between items-center mt-10">
                        <div className="flex flex-row w-full justify-start items-center gap-2">
                            {/* Redirect to view workstream in full */}
                            <a className="flex flex-row justify-start items-center hover:underline">
                                Go to workstream
                                <Icon
                                    name="arrowRight"
                                    className="hover:stroke-2"
                                />
                            </a>
                            {/* Delete function */}
                            <div
                                className={`inline-flex bg-rose-600 rounded-2xl px-3 py-1.5 mb-6 self-end 
                                        hover:bg-rose-700 stroke-2 gap-1 transition ease-in cursor-pointer 
                                        w-fit text-stone-200 font-medium`}
                                onClick={() => setIsDelModalOpen(true)}
                            >
                                <Icon
                                    name={"delete"}
                                    size="md"
                                    className="stroke-stone-200 hover:stroke-[2]"
                                />
                                Delete
                            </div>
                        </div>
                    </div>
                    {/* <WorkstreamView workstream={selectedWorkstream} /> */}
                </SideDrawer>
            )}
        </div>
    );
}
