"use client";

import { textOrToBeFilled } from "./citation";
import { WorkstreamType } from "./data-type";

export interface WorkstreamPreviewProps {
    workstream: WorkstreamType;
}

export default function StartupView({ workstream }: WorkstreamPreviewProps) {
    return (
        <div className="flex flex-col justify-start items-start mt-6 gap-4 w-full space-y-8 min-h-fit overflow-auto">
            <div className="flex flex-col justify-start w-full gap-2">
                <div>
                    <span className="font-bold">Country:</span>{" "}
                    {textOrToBeFilled(workstream.use_case)}
                </div>
                <div>
                    <span className="font-bold">Year founded:</span>{" "}
                    {textOrToBeFilled(workstream.challenge)}
                </div>
            </div>
        </div>
    );
}
