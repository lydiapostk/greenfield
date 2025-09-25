"use client";

import Icon from "@/components/icon/icon";
import { StartupType } from "./startup-data-type";
import { useEffect, useState } from "react";

export interface UserDrawerProp {
    startup: StartupType;
    onClose: () => void;
}

const textOrUnknown = (text: string | undefined | null) =>
    text ? text : "Unknown";

export default function StartupDrawer({ startup, onClose }: UserDrawerProp) {
    const [isClosing, setIsClosing] = useState(false);
    // Trigger slide-out animation before closing
    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200); // match CSS animation duration
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                triggerClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [triggerClose]);

    return (
        <div className="fixed inset-0 flex justify-end bg-black/40">
            <div
                className={`w-2/5 bg-stone-100/95 text-gray-900 shadow-2xl h-full p-6 overflow-y-auto ${
                    isClosing ? "animate-slideOut" : "animate-slideIn"
                }`}
            >
                <div className="flex flex-col justify-start items-start mb-4 gap-4">
                    <Icon
                        onClick={triggerClose}
                        name={"close"}
                        size="lg"
                        className="stroke-indigo-600 hover:stroke-[2]"
                    />
                    <h2 className="text-3xl font-bold pb-10">
                        {startup.company_name}
                    </h2>
                    {startup.company_website && (
                        <a
                            href={startup.company_website}
                            target="_blank"
                            className="relative flex flex-row justify-start items-center gap-3 cursor-pointer"
                        >
                            <Icon name={"website"} size="md" />
                            <span className="hover:text-indigo-900 hover:underline">
                                {startup.company_website}
                            </span>
                        </a>
                    )}

                    <div className="grid grid-cols-2 justify-between gap-2 w-full">
                        <div className="flex flex-col justify-start w-full gap-2">
                            <p>
                                <span className="font-bold">Country:</span>{" "}
                                {textOrUnknown(startup.country)}
                            </p>
                            <p>
                                <span className="font-bold">Year founded:</span>{" "}
                                {textOrUnknown(startup.year_founded)}
                            </p>
                            <p>
                                <span className="font-bold">
                                    No. employees:
                                </span>{" "}
                                {textOrUnknown(startup.num_employees)}
                            </p>
                        </div>
                        <div className="flex flex-col justify-start w-full gap-2">
                            <p>
                                <span className="font-bold">TRL:</span>{" "}
                                {textOrUnknown(startup.trl)}
                            </p>
                            <p>
                                <span className="font-bold">Funds raised:</span>{" "}
                                {textOrUnknown(startup.funds_raised)}
                            </p>
                            <p>
                                <span className="font-bold">
                                    Funding stage:
                                </span>{" "}
                                {textOrUnknown(startup.funding_stage)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">
                            Technology Offering
                        </h3>
                        <p className="text-gray-700">
                            {textOrUnknown(startup.tech_offering)}
                        </p>
                    </div>
                    <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">
                            Unique Value Proposition
                        </h3>
                        <p className="text-gray-700">
                            {textOrUnknown(startup.uvp)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
