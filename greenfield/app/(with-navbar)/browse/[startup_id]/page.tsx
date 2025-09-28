"use client";

import { use, useEffect, useState } from "react";
import StartupEditForm from "../../(startup-display-components)/startup-edit-form";
import { StartupType } from "../../(startup-display-components)/startup-data-type";

export default function DoubleClick({
    params,
}: {
    params: Promise<{ startup_id: string }>;
}) {
    const { startup_id } = use(params); // unwrap the Promise
    const decodedStartupId = decodeURIComponent(startup_id);
    const [error, setError] = useState<string>("");
    const [startup, setStartup] = useState<StartupType | null>(null);

    useEffect(() => {
        fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL
            }/startups/fetch/by_id?id=${encodeURIComponent(decodedStartupId)}`
        )
            .then((res) =>
                res.json().then((data: StartupType) => {
                    setStartup(data);
                })
            )
            .catch((error) =>
                setError(
                    `Unexpected error occured when fetching start-up!\n${error}`
                )
            );
    }, []);

    return (
        <div className="w-full h-full bg-stone-200">
            <div className="w-4xl sm:w-xl overflow-hidden place-self-center my-10 flex flex-col justify-start">
                {startup && (
                    <StartupEditForm
                        startup={startup}
                        setStartup={setStartup}
                    />
                )}
            </div>
        </div>
    );
}
