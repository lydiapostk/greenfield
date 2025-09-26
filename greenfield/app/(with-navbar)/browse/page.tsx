"use client";

import { useEffect, useState } from "react";
import StartupTable from "./startup_table";
import { StartupType } from "./startup-data-type";
import StartupDrawer from "./startup_drawer";

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
                })
            )
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <div className="flex flex-col justify-start items-center w-full h-full text-white">
            <h1 className="text-xl font-bold mb-6">Browse Database</h1>
            <StartupTable
                startups={startups}
                setSelectedStartup={setSelectedStartup}
            />
            {selectedStartup && (
                <StartupDrawer
                    startup={selectedStartup}
                    onClose={() => setSelectedStartup(null)}
                />
            )}
        </div>
    );
}
