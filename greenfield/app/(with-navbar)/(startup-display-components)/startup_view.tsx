"use client";

import Icon from "@/components/icon/icon";
import { StartupType } from "./startup-data-type";
import { useRef } from "react";
import CollapsibleSection from "./collapsible-section";
import { getCitationAsElement, textOrUnknown } from "./citation";

export interface StartupViewProp {
    startup: StartupType;
}

export default function StartupView({ startup }: StartupViewProp) {
    const trlExplanation = (
        <div className="pb-6">
            <h4 className="italic">How was TRL estimated?</h4>{" "}
            <p className="font-mono">{startup.trl_explanation}</p>
        </div>
    );
    const fundAndTRLSectionRef = useRef<(() => void) | null>(null);

    const fundInfoExpansion = CollapsibleSection(
        getCitationAsElement(startup, "ref_funding"),
        fundAndTRLSectionRef
    );
    const techInfoExpansion = CollapsibleSection(
        getCitationAsElement(startup, "ref_tech")
    );
    const uvpInfoExpansion = CollapsibleSection(
        getCitationAsElement(startup, "ref_uvp")
    );
    const trlExpansion = CollapsibleSection(
        trlExplanation,
        fundAndTRLSectionRef
    );

    return (
        <div className="flex flex-col justify-start items-start mt-6 gap-4">
            <h2 className="text-3xl font-bold mr-3">{startup.company_name}</h2>
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
                    <div>
                        <span className="font-bold">Country:</span>{" "}
                        {textOrUnknown(startup.country)}
                    </div>
                    <div>
                        <span className="font-bold">Year founded:</span>{" "}
                        {textOrUnknown(startup.year_founded)}
                    </div>
                    <div>
                        <span className="font-bold">No. employees:</span>{" "}
                        {textOrUnknown(startup.num_employees)}
                    </div>
                </div>
                <div className="flex flex-col justify-start w-full gap-2">
                    <div className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
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
                    </div>
                    <div className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
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
                    </div>
                    <div className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
                        <span className="font-bold">Funding stage:</span>{" "}
                        {textOrUnknown(startup.funding_stage)}
                    </div>
                </div>
            </div>
            {fundInfoExpansion.component}
            {trlExpansion.component}

            <div className="mt-6">
                <div className="flex flex-row whitespace-nowrap justify-start items-center w-full gap-1">
                    <h3 className="font-bold text-lg">Technology Offering</h3>
                    {
                        <Icon
                            name={"info"}
                            className="stroke-indigo-600 hover:stroke-[2]"
                            onClick={techInfoExpansion.controlFn}
                        />
                    }
                </div>
                {techInfoExpansion.component}
                <div className="text-gray-700">
                    {textOrUnknown(startup.tech_offering)}
                </div>
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
                <div className="text-gray-700">
                    {textOrUnknown(startup.uvp)}
                </div>
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
                                    {maybeLIURL != undefined && (
                                        <a
                                            href={maybeLIURL as string}
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
                    <h3 className="font-bold mb-2">Notable Investors</h3>
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
    );
}
