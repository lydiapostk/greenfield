"use client";

import { useEffect, useMemo, useState } from "react";
import StartupTable from "@/startup_display/startup_table";
import { StartupType } from "@/startup_display/startup-data-type";
import SideDrawer from "@/components/side_drawer";
import Icon from "@/components/icon/icon";
import ConfirmModal from "@/components/confirm-modal";
import StartupView from "../(startup-display-components)/startup_view";
import StartupEditForm from "../(startup-display-components)/startup-edit-form";

export default function BrowseStartups() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inFullScreen, setInFullScreen] = useState<boolean>(false);
    const [startups, setStartups] = useState<StartupType[]>([]);
    const [selectedStartup, setSelectedStartup] = useState<StartupType | null>(
        null
    );
    const [inEditMode, setInEditMode] = useState<boolean>(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/startups/`)
            .then((res) =>
                res.json().then((data: StartupType[]) => {
                    setStartups(data);
                    setIsLoading(false);
                })
            )
            .catch(() => setIsLoading(false));
    }, []);
    const [search, setSearch] = useState<string>("");
    // Filter list if searching
    const filteredValues = useMemo(() => {
        return startups.filter((startup) =>
            startup.company_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [startups, search]);
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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

            {isDelModalOpen && (
                <ConfirmModal
                    isOpen={true}
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
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <Icon name={"spinner"} color="blue" size={"lg"} />
                </div>
            )}
            <div className="self-center lg:w-3/5">
                <div className="flex flex-row justify-start items-center py-2">
                    <div
                        className={`inline-flex bg-rose-600 rounded-2xl px-3 py-1.5 
                                hover:bg-rose-700 stroke-2 gap-1 transition ease-in
                                ${
                                    selectedIds.length > 0 && !selectedStartup
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
                    }}
                    inFullScreen={inFullScreen}
                >
                    <div className="flex flex-row w-full justify-between items-center mt-10">
                        <div className="flex flex-row w-full justify-start items-center gap-2">
                            <div
                                className={`inline-flex w-fit rounded-2xl px-3 py-1.5 mb-6 self-end 
                                        stroke-2 gap-1 transition ease-in cursor-pointer 
                                        ${
                                            inEditMode
                                                ? "bg-violet-200  hover:bg-violet-100 text-stone-700"
                                                : "bg-violet-600  hover:bg-violet-700 text-stone-200"
                                        } font-medium`}
                                onClick={() => setInEditMode(!inEditMode)}
                            >
                                {!inEditMode && (
                                    <Icon
                                        name={"edit"}
                                        size="md"
                                        className="stroke-stone-200 hover:stroke-[2]"
                                    />
                                )}
                                {inEditMode ? "Exit edit mode" : "Edit"}
                            </div>
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
                        <div
                            className={`inline-flex w-fit rounded-2xl px-3 py-1.5 mb-6 self-end 
                                        stroke-2 gap-1 transition ease-in cursor-pointer 
                                        hover:bg-stone-300`}
                            onClick={() => setInFullScreen(!inFullScreen)}
                        >
                            <Icon
                                name={
                                    inFullScreen
                                        ? "arrowsPointingIn"
                                        : "arrowsPointingOut"
                                }
                                size="md"
                                className="stroke-stone-800 hover:stroke-[2]"
                            />
                        </div>
                    </div>
                    {inEditMode ? (
                        <StartupView startup={selectedStartup} />
                    ) : (
                        <StartupEditForm
                            startup={selectedStartup}
                            setStartup={setSelectedStartup}
                        />
                    )}
                </SideDrawer>
            )}
        </div>
    );
}
