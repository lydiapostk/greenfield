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
                    console.log(data);
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
            <div className="max-w-4xl sm:min-w-2xl place-self-center my-10 flex flex-col justify-start">
                {startup && (
                    <div>
                        <h1 className="text-3xl font-bold pb-10">
                            {startup.company_name}
                        </h1>
                    </div>
                )}
                {startup && <StartupEditForm startup={startup} />}
            </div>
        </div>
    );
}
