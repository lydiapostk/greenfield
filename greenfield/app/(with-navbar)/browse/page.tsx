"use client";

import { useEffect, useState } from "react";
import StartupTable from "@/startup_display/startup_table";
import { StartupType } from "@/startup_display/startup-data-type";
import StartupDrawer from "@/startup_display/startup_drawer";
import Icon from "@/components/icon/icon";

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

    return (
        <div className="flex flex-col justify-start items-center w-full h-full text-white">
            <h1 className="text-xl font-bold my-6">Browse Database</h1>
            <StartupTable
                startups={startups}
                onClickStartup={setSelectedStartup}
                searchable={true}
            />
            {isLoading && <Icon name={"spinner"} size={"md"} color="blue" />}
            {selectedStartup && (
                <StartupDrawer
                    startup={selectedStartup}
                    onClose={() => setSelectedStartup(null)}
                />
            )}
        </div>
    );
}
