"use client";

import { useEffect, useState } from "react";
import StartupTable from "./startup_table";
import { StartupType, UserType } from "./startup-data-type";
import StartupDrawer from "./startup_drawer";

const data: UserType[] = [
    {
        id: 1,
        name: "Alice Johnson",
        role: "Designer",
        email: "alice@example.com",
    },
    {
        id: 2,
        name: "Mark Rivera",
        role: "Developer",
        email: "mark@example.com",
    },
    {
        id: 3,
        name: "Sophia Chen",
        role: "Product Manager",
        email: "sophia@example.com",
    },
];

export default function BrowseStartups() {
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
            .catch();
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
