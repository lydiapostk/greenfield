"use client";

import Icon from "@/components/icon/icon";
import { StartupType } from "./startup-data-type";
import { useEffect, useRef, useState } from "react";
import ExpandableSection from "./collapsible-section";
import { citation, textOrUnknown } from "./citation";

export interface UserDrawerProp {
    startup: StartupType;
    onClose: () => void;
}

export default function StartupDrawer({ startup, onClose }: UserDrawerProp) {
    const [isClosing, setIsClosing] = useState(false);
    const trlExplanation = (
        <div className="pb-6">
            <h4 className="italic">How was TRL estimated?</h4>{" "}
            <p className="font-mono">{startup.trl_explanation}</p>
        </div>
    );
    const fundAndTRLSectionRef = useRef<(() => void) | null>(null);

    const fundInfoExpansion = ExpandableSection(
        citation(startup, "fund"),
        fundAndTRLSectionRef
    );
    const techInfoExpansion = ExpandableSection(citation(startup, "tech"));
    const uvpInfoExpansion = ExpandableSection(citation(startup, "uvp"));
    const trlExpansion = ExpandableSection(
        trlExplanation,
        fundAndTRLSectionRef
    );

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
                            <p className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
                                <span className="font-bold">TRL:</span>{" "}
                                {textOrUnknown(startup.trl)}
                                {
                                    <Icon
                                        name={"info"}
                                        key={"funds_raised"}
                                        className="stroke-indigo-600 hover:stroke-[2]"
                                        onClick={trlExpansion.controlFn}
                                    />
                                }
                            </p>
                            <p className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
                                <span className="font-bold">Funds raised:</span>{" "}
                                {textOrUnknown(startup.funds_raised)}
                                {
                                    <Icon
                                        name={"info"}
                                        key={"funds_raised"}
                                        className="stroke-indigo-600 hover:stroke-[2]"
                                        onClick={fundInfoExpansion.controlFn}
                                    />
                                }
                            </p>
                            <p className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
                                <span className="font-bold">
                                    Funding stage:
                                </span>{" "}
                                {textOrUnknown(startup.funding_stage)}
                            </p>
                        </div>
                    </div>
                    {fundInfoExpansion.component}
                    {trlExpansion.component}

                    <div className="mt-6">
                        <div className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
                            <h3 className="font-bold text-lg">
                                Technology Offering
                            </h3>
                            {
                                <Icon
                                    name={"info"}
                                    className="stroke-indigo-600 hover:stroke-[2]"
                                    onClick={techInfoExpansion.controlFn}
                                />
                            }
                        </div>
                        {techInfoExpansion.component}
                        <p className="text-gray-700">
                            {textOrUnknown(startup.tech_offering)}
                        </p>
                    </div>
                    <div className="mt-6">
                        <div className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
                            <h3 className="font-bold text-lg">
                                Unique Value Proposition
                            </h3>
                            {
                                <Icon
                                    name={"info"}
                                    className="stroke-indigo-600 hover:stroke-[2]"
                                    onClick={uvpInfoExpansion.controlFn}
                                />
                            }
                        </div>
                        {uvpInfoExpansion.component}
                        <p className="text-gray-700">
                            {textOrUnknown(startup.uvp)}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 justify-between w-full">
                        <div>
                            <h3 className="font-bold mb-2">Founders</h3>
                            {startup.founders ? (
                                Object.entries(startup.founders).map(
                                    ([founder, maybeLIURL]) => (
                                        <span
                                            key={founder}
                                            className=" w-full text-gray-700 flex flex-row gap-3 justify-start items-center "
                                        >
                                            <span className="font-medium whitespace-nowrap">
                                                {founder}
                                            </span>
                                            {maybeLIURL && (
                                                <a
                                                    href={maybeLIURL}
                                                    target="_blank"
                                                    className="hover:text-indigo-900 hover:underline truncate"
                                                >
                                                    <Icon
                                                        name="linkedin"
                                                        className="fill-indigo-900"
                                                    />
                                                </a>
                                            )}
                                        </span>
                                    )
                                )
                            ) : (
                                <p className="text-gray-700">"Unknown"</p>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">
                                Notable Investors
                            </h3>
                            {startup.investors ? (
                                <ul className="list-disc pl-5">
                                    {startup.investors.map((investor) => (
                                        <li
                                            key={investor}
                                            className=" w-full text-gray-700 font-medium whitespace-nowrap"
                                        >
                                            {investor}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700">"Unknown"</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
