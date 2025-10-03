import { useState } from "react";

import Icon from "@/components/icon/icon";
import EditableTextField from "@/components/input-field/editable-text-field";

import {
    WorkstreamReadType,
    WorkstreamUpsertType,
} from "@/data_display/data-type";
import StartupTable from "@/startups/startup-table";
import { getUpdateWSFunction } from "@/data_display/utils";

interface WorkstreamEditFormProps<> {
    workstream: WorkstreamReadType;
    updateWorkstream: (workstream: WorkstreamReadType) => void;
}

export default function WorkstreamEditForm({
    workstream,
    updateWorkstream,
}: WorkstreamEditFormProps) {
    const [error, setError] = useState<string>("");

    const funcUpdateWS = getUpdateWSFunction({
        workstream_id: workstream.id,
        updateWorkstream: updateWorkstream,
        setError: setError,
    });

    return (
        <div className="flex flex-col justify-start items-start mt-6 gap-4 w-full space-y-8 min-h-fit overflow-auto">
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
            <div className="flex flex-col justify-start w-full gap-2">
                <EditableTextField
                    label="Title:"
                    field_key="title"
                    value={workstream.title}
                    onSave={funcUpdateWS}
                    fontStyle="text-3xl font-bold"
                    showLabel={false}
                />
                <EditableTextField
                    label="Use Case:"
                    field_key="use_case"
                    value={workstream.use_case ? workstream.use_case : ""}
                    onSave={funcUpdateWS}
                    multiline={true}
                    textAreaSize={"sm"}
                />
                <EditableTextField
                    label="Challenge:"
                    field_key="challenge"
                    value={workstream.challenge ? workstream.challenge : ""}
                    onSave={funcUpdateWS}
                    multiline={true}
                    textAreaSize={"sm"}
                />
            </div>

            <div className="flex flex-col whitespace-nowrap justify-start w-full gap-1">
                <span className="font-bold min-w-fit">Start-ups</span>
                <StartupTable
                    startups={workstream.evaluations.map(
                        (evaluation) => evaluation.startup
                    )}
                />
            </div>
        </div>
    );
}
