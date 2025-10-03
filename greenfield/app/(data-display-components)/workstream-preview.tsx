"use client";

import Icon from "@/components/icon/icon";
import { textOrToBeFilled } from "./citation";
import { WorkstreamType } from "./data-type";

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
            <div className="flex flex-col justify-start w-full gap-2">
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
                    <ul className="list-disc pl-5">
                        {workstream.evaluations.map((evaluation) => {
                            const sup = evaluation.startup;
                            return (
                                <li key={sup.id}>
                                    <span className="font-medium whitespace-nowrap">
                                        {evaluation.startup.company_name}
                                    </span>
                                    {sup.company_website &&
                                        sup.company_website != "" && (
                                            <a
                                                href={sup.company_website}
                                                target="_blank"
                                                className="hover:text-indigo-900 hover:underline truncate"
                                            >
                                                <Icon
                                                    name="website"
                                                    className="fill-indigo-900"
                                                />
                                            </a>
                                        )}
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
