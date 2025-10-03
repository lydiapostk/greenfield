"use client";

import Icon from "@/components/icon/icon";
import { WorkstreamType } from "@/data_display/data-type";
import { textOrToBeFilled } from "@/data_display/utils";

export interface WorkstreamPreviewProps {
    workstream: WorkstreamType;
}

export default function WorkstreamPreview({
    workstream,
}: WorkstreamPreviewProps) {
    return (
        <div className="flex flex-col justify-start items-start mt-6 gap-4 w-full space-y-8 min-h-fit overflow-auto">
            <span className="font-bold text-3xl mb-0">
                {textOrToBeFilled(workstream.title)}
            </span>
            {/* Redirect to view workstream in full */}
            <a
                className="flex flex-row justify-start items-center cursor-pointer hover:underline"
                href={`analyse/${workstream.id}`}
            >
                Go to workstream
                <Icon name="arrowRight" className="" />
            </a>
            <div className="flex flex-col justify-start w-full gap-6">
                <div>
                    <span className="font-bold">Use case:</span>{" "}
                    {textOrToBeFilled(workstream.use_case)}
                </div>
                <div>
                    <span className="font-bold">Challenge:</span>{" "}
                    {textOrToBeFilled(workstream.challenge)}
                </div>
                <div className="flex flex-col justify-start">
                    <span className="font-bold">Start-ups:</span>{" "}
                    {workstream.evaluations.length == 0 && (
                        <div className="text-stone-400 w-full font-medium italic">
                            No start-ups added yet.
                        </div>
                    )}
                    <ul className="list-disc list-outside pl-5">
                        {workstream.evaluations.map((evaluation) => {
                            const sup = evaluation.startup;
                            const hasWebsite =
                                sup.company_website &&
                                sup.company_website != "";
                            return (
                                <li key={sup.id}>
                                    <a
                                        href={
                                            sup.company_website &&
                                            sup.company_website != ""
                                                ? sup.company_website
                                                : undefined
                                        }
                                        target={
                                            hasWebsite ? "_blank" : undefined
                                        }
                                        className="truncate flex flex-row justify-start items-start gap-2 
                                        hover:text-indigo-900 hover:underline cursor-pointer"
                                    >
                                        <span className="font-medium whitespace-nowrap">
                                            {evaluation.startup.company_name}
                                        </span>
                                        {hasWebsite && (
                                            <Icon name="website" size={"md"} />
                                        )}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div>
                    <span className="font-bold">Recommendation:</span>{" "}
                    {textOrToBeFilled(workstream.overall_recommendation)}
                </div>
            </div>
        </div>
    );
}
