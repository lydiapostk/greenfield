"use client";

import { ReactElement, useRef } from "react";
import Icon from "@/components/icon/icon";
import { getCitationAsElement, textOrUnknown } from "./citation";
import CollapsibleSection from "./collapsible-section";
import { StartupType } from "./data-type";

export interface StartupViewProps {
    startup: StartupType;
    topToolbar?: ReactElement;
    bottomToolbar?: ReactElement;
}

export default function StartupView({
    startup,
    topToolbar,
    bottomToolbar,
}: StartupViewProps) {
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
        <div
            className="flex flex-col w-full place-self-center 
            justify-start items-start mt-6 gap-4 space-y-8 min-h-fit overflow-auto"
        >
            {topToolbar}
            <a
                className="flex flex-row justify-start items-center my-0 cursor-pointer hover:underline"
                href={`browse/${startup.id}`}
            >
                Go to startup
                <Icon name="arrowRight" className="" />
            </a>
            <div className="text-3xl font-bold mr-3 my-0">
                {startup.company_name}
            </div>
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

            <div>
                <h3 className="font-bold mb-2">Use Cases</h3>
                {startup.use_cases ? (
                    <ul className="list-disc pl-5">
                        {startup.use_cases.map((use_case) => (
                            <li
                                key={use_case}
                                className=" w-full text-gray-700 font-medium text-wrap"
                            >
                                {use_case}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-700">"Unknown"</p>
                )}
            </div>
            <div>
                <h3 className="font-bold mb-2">Competitors</h3>
                {startup.competitors ? (
                    <ul className="list-disc pl-5">
                        {startup.competitors.map((competitor) => {
                            const competitorName = Object.keys(competitor)[0];
                            const refUrl = competitor[competitorName].url;
                            return (
                                <li
                                    key={competitorName}
                                    className=" w-full text-gray-700 font-medium text-wrap mt-2"
                                >
                                    <a
                                        key={competitorName}
                                        href={refUrl ? refUrl : ""}
                                        target={refUrl ? "_blank" : ""}
                                        className={
                                            refUrl
                                                ? "hover:text-indigo-900 hover:underline"
                                                : ""
                                        }
                                    >
                                        <h3 className="font-bold mb-2">
                                            {competitorName}
                                            {competitor[competitorName].url && (
                                                <Icon
                                                    name={"arrowTopRight"}
                                                    size={"sm"}
                                                    className="inline-block align-text-bottom pl-1"
                                                />
                                            )}
                                        </h3>
                                    </a>
                                    {competitor[competitorName].description}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-700">"Unknown"</p>
                )}
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
            {bottomToolbar}
        </div>
    );
}
