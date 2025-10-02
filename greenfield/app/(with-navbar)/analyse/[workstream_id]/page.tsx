"use client";

import { use, useEffect, useState } from "react";
import Icon from "@/components/icon/icon";
// import WorkstreamEditForm from "@/data_display/workstream-edit-form";
import { WorkstreamType } from "@/data_display/data-type";

export default function DoubleClick({
    params,
}: {
    params: Promise<{ workstream_id: string }>;
}) {
    const { workstream_id } = use(params); // unwrap the Promise
    const decodedWorkstreamId = decodeURIComponent(workstream_id);
    const [error, setError] = useState<string>("");
    const [workstream, setWorkstream] = useState<WorkstreamType | null>(null);

    useEffect(() => {
        fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL
            }/workstreams/${encodeURIComponent(decodedWorkstreamId)}`,
            {
                method: "DELETE",
            }
        )
            .then((res) =>
                res.json().then((data: WorkstreamType) => {
                    if (!res.ok) {
                        setError(
                            `Unexpected error occured when fetching workstream!\n${res.statusText}`
                        );
                    }
                    setWorkstream(data);
                })
            )
            .catch((error) =>
                setError(
                    `Unexpected error occured when fetching workstream!\n${error}`
                )
            );
    }, []);

    return (
        <div className="w-full h-full bg-stone-200">
            <div className="w-4xl overflow-hidden place-self-center my-10 flex flex-col justify-start">
                {!workstream && (
                    <Icon
                        name={"spinner"}
                        size={"md"}
                        color="blue"
                        style={{ pointerEvents: "none" }}
                        className={`text-stone-200 fill-indigo-600 self-center`}
                    />
                )}
                {error && error !== "" && (
                    <div className="flex flex-row items-center justify-start gap-2 font-mono italic text-red-700">
                        <Icon
                            name={"error"}
                            className=""
                            strokeWidth={2}
                            size="sm"
                        />
                        {error}
                    </div>
                )}
                {/* {workstream && (
                    <StartupEditForm
                        startup={workstream}
                        setStartup={setWorkstream}
                    />
                )} */}
            </div>
        </div>
    );
}
