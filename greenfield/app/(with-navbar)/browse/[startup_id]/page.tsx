"use client";

import { use, useEffect, useState } from "react";
import StartupEditForm from "../../(startup-display-components)/startup-edit-form";
import { StartupType } from "../../(startup-display-components)/startup-data-type";
import Icon from "@/components/icon/icon";
import ConfirmModal from "@/components/confirm-modal";
import { useRouter } from "next/navigation";

export default function DoubleClick({
    params,
}: {
    params: Promise<{ startup_id: string }>;
}) {
    const { startup_id } = use(params); // unwrap the Promise
    const decodedStartupId = decodeURIComponent(startup_id);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
    const router = useRouter();

    const [isDelModalOpen, setIsDelModalOpen] = useState<boolean>(false);
    const onDelStartups = () => {
        console.log("Deleting...");
        setIsLoading(true);
        setTimeout(() => {
            // simulate api call
            router.push(`/browse`); // redirect to main page
        }, 3000);
    };

    return (
        <div className="w-full h-full bg-stone-200">
            <div className="w-4xl overflow-hidden place-self-center my-10 flex flex-col justify-start">
                {(!startup || isLoading) && (
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
                {isDelModalOpen && startup && !isLoading && (
                    <ConfirmModal
                        isOpen={true}
                        confirmText={`Delete`}
                        onClose={() => setIsDelModalOpen(false)}
                        onConfirm={onDelStartups}
                    />
                )}
                {!isLoading && startup && (
                    <div
                        className={`inline-flex bg-rose-600 rounded-2xl px-3 py-1.5 mb-6 self-end 
                                hover:bg-rose-700 stroke-2 gap-1 transition ease-in cursor-pointer 
                                w-fit text-stone-200 font-medium`}
                        onClick={() => {
                            setIsDelModalOpen(true);
                        }}
                    >
                        <Icon
                            name={"delete"}
                            color="white"
                            size={"sm"}
                            className="self-center"
                        />
                        Delete
                    </div>
                )}
                {!isLoading && startup && (
                    <StartupEditForm
                        startup={startup}
                        setStartup={setStartup}
                    />
                )}
            </div>
        </div>
    );
}
