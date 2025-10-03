"use client";

import { useEffect, useMemo, useState } from "react";
import SideDrawer from "@/components/side_drawer";
import ConfirmModal from "@/components/confirm-modal";
import Icon from "@/components/icon/icon";
import { StartupReadType } from "@/data_display/data-type";
import StartupEditForm from "@/startups/startup-edit-form";
import StartupTable from "@/startups/startup-table";
import StartupView from "@/startups/startup-view";
import ToggleViewEditButton from "../components/toggle-view-edit-button";
import DeleteButton from "../components/delete-button";

export default function BrowseStartups() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
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

    // Sidebar controls
    const [inFullScreen, setInFullScreen] = useState<boolean>(false);
    const [selectedStartup, setSelectedStartup] =
        useState<StartupReadType | null>(null);
    const [inEditMode, setInEditMode] = useState<boolean>(false);
    useEffect(() => {
        if (!selectedStartup) return;
        // Update startups
        const updatedStartups = [...startups];
        const idxToUpdate = updatedStartups.findIndex((sup) => {
            return sup.id == selectedStartup.id;
        });
        updatedStartups[idxToUpdate] = selectedStartup;
        setStartups(updatedStartups);
    }, [selectedStartup]);
    const toggleEditViewComponent = () => (
        <ToggleViewEditButton
            inEditMode={inEditMode}
            setInEditMode={setInEditMode}
        />
    );
    const deleteButtonComponent = (delText?: string) => (
        <DeleteButton
            onClick={() => setIsDelModalOpen(true)}
            showText={true}
            deleteText={delText}
        />
    );
    const toggleFullscreenComponent = () => (
        <div
            className={`inline-flex w-fit rounded-2xl px-3 py-1.5 mb-6 self-end 
                                        stroke-2 gap-1 transition ease-in cursor-pointer 
                                        hover:bg-stone-300`}
            onClick={() => setInFullScreen(!inFullScreen)}
        >
            <Icon
                name={inFullScreen ? "arrowsPointingIn" : "arrowsPointingOut"}
                size="md"
                className="stroke-stone-800 hover:stroke-[2]"
            />
        </div>
    );
    const toolbar = (hasFullscreenToggle = false) => (
        <div className="flex flex-row w-full justify-between items-center mt-10">
            <div className="flex flex-row w-full justify-start items-center gap-2">
                {toggleEditViewComponent()}
                {deleteButtonComponent()}
            </div>
            {/* Enter full screen */}
            {hasFullscreenToggle && toggleFullscreenComponent()}
        </div>
    );

    // Table controls
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState<string>("");
    const filteredValues = useMemo(() => {
        return startups.filter((startup) =>
            startup.company_name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [startups, search]);

    // Delete Modal
    const [isDelModalOpen, setIsDelModalOpen] = useState<boolean>(false);
    const [delError, setDelError] = useState<string>("");
    const onDelStartups = (startupIDsToDel: number[]) => {
        setIsLoading(true);
        setIsDelModalOpen(false);
        setDelError("");
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/startups/bulk/by_ids`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(startupIDsToDel),
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
                        setSelectedStartup(null);
                        setStartups(
                            startups.filter(
                                (startup) =>
                                    !startupIDsToDel.includes(
                                        startup.id as number
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
                Browse Database
            </h1>
            <input
                id="table_search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-4/5 px-4 py-2 my-2 self-center rounded-2xl bg-white/10 focus:outline-none focus:ring-0 focus:bg-white/20"
                autoFocus
            />

            {/* Delete Modal */}
            {isDelModalOpen && (
                <ConfirmModal
                    confirmText={`Delete (${
                        selectedStartup ? 1 : selectedIds.length
                    })`}
                    onClose={() => setIsDelModalOpen(false)}
                    onConfirm={() =>
                        selectedStartup
                            ? onDelStartups([selectedStartup.id as number])
                            : onDelStartups(selectedIds)
                    }
                    error={delError}
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
                    <DeleteButton
                        onClick={() => setIsDelModalOpen(true)}
                        showText={true}
                        deleteText={`Delete (${selectedIds.length})`}
                        disabled={selectedIds.length == 0 || !!selectedStartup}
                    />
                </div>
                {/* Table */}
                <StartupTable
                    startups={filteredValues}
                    onClickStartup={setSelectedStartup}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                />
            </div>
            {selectedStartup && (
                <SideDrawer
                    onClose={() => {
                        setSelectedStartup(null);
                        setInFullScreen(false);
                        setInEditMode(false);
                        setDelError("");
                    }}
                    inFullScreen={inFullScreen}
                >
                    {/* Sidebar tools */}

                    {/* Choice of displaying edit or view mode*/}
                    {inEditMode ? (
                        <StartupEditForm
                            startup={selectedStartup}
                            setStartup={setSelectedStartup}
                            topToolbar={toolbar(true)}
                            bottomToolbar={toolbar(false)}
                        />
                    ) : (
                        <StartupView
                            startup={selectedStartup}
                            topToolbar={toolbar(true)}
                            bottomToolbar={toolbar(false)}
                        />
                    )}
                </SideDrawer>
            )}
        </div>
    );
}
