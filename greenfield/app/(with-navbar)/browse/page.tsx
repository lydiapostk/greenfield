"use client";

import { useEffect, useMemo, useState } from "react";
import StartupTable from "@/startup_display/startup_table";
import { StartupType } from "@/startup_display/startup-data-type";
import StartupDrawer from "@/startup_display/startup_drawer";
import Icon from "@/components/icon/icon";
import ConfirmModal from "@/components/confirm-modal";

export default function BrowseStartups() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [startups, setStartups] = useState<StartupType[]>([]);
    const [selectedStartup, setSelectedStartup] = useState<StartupType | null>(
        null
    );

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
    const onDelStartups = (startupIDsToDel: number[]) => {
        setIsLoading(true);
        setIsDelModalOpen(false);
        setTimeout(() => {
            console.log(
                startups.filter(
                    (startup) => !startupIDsToDel.includes(startup.id as number) // simulate api call
                )
            );
            // Reset
            setSelectedIds([]);
            setIsLoading(false);
        }, 3000);
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
                    confirmText={`Delete (${selectedIds.length})`}
                    onClose={() => setIsDelModalOpen(false)}
                    onConfirm={() => onDelStartups(selectedIds)}
                />
            )}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <Icon name={"spinner"} color="blue" size={"lg"} />
                </div>
            )}
            <div className="self-center lg:max-w-3/5">
                <div className="flex flex-row justify-start items-center py-2">
                    <div
                        className={`inline-flex bg-rose-600 rounded-2xl px-3 py-1.5 
                                hover:bg-rose-700 stroke-2 gap-1 transition ease-in
                                ${
                                    selectedIds.length > 0
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
                <StartupDrawer
                    startup={selectedStartup}
                    onClose={() => setSelectedStartup(null)}
                />
            )}
        </div>
    );
}
