import { useState } from "react";

import Icon from "@/components/icon/icon";
import EditableTextField from "@/components/input-field/editable-text-field";
import EditableDropdownField from "@/components/input-field/editable-dropdown-field";

import { COUNTRIES } from "./countries";
import { WorkstreamType, WorkstreamUpsertType } from "./data-type";
import StartupTable from "./startup-table";

interface WorkstreamEditFormProps {
    workstream?: WorkstreamType;
    setWorkstream?: (workstream: WorkstreamType) => void;
}

export default function WorkstreamEditForm({
    workstream,
    setWorkstream,
}: WorkstreamEditFormProps) {
    const [error, setError] = useState<string>("");

    const updateField = (field: keyof WorkstreamUpsertType, value: string) => {
        const workstream_update: Record<string, string> = {};
        workstream_update[field] = value.trim();
        if (workstream) {
            // Only update field immediately if workstream exists
            fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/workstreams/${encodeURIComponent(workstream.id)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(workstream_update),
                }
            )
                .then((res) =>
                    res.json().then((data: WorkstreamType) => {
                        if (res.ok) setWorkstream && setWorkstream(data);
                        else
                            setError(
                                `Unexpected error occured when updating workstream!\n${res.statusText}`
                            );
                    })
                )
                .catch((error) =>
                    setError(
                        `Unexpected error occured when updating workstream!\n${error}`
                    )
                );
        }
    };

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
                    label="Use Case:"
                    field_key="use_case"
                    value={workstream?.use_case ? workstream.use_case : ""}
                    onSave={updateField}
                    multiline={true}
                />
                <EditableTextField
                    label="Challenge:"
                    field_key="challenge"
                    value={workstream?.challenge ? workstream.challenge : ""}
                    onSave={updateField}
                    multiline={true}
                />
            </div>

            <div className="flex flex-col whitespace-nowrap justify-start w-full gap-1">
                <StartupTable
                    startups={
                        workstream?.evaluations
                            ? workstream?.evaluations.map(
                                  (evaluation) => evaluation.startup
                              )
                            : []
                    }
                />
            </div>

            <EditableTextField
                label="Conclusion:"
                field_key="overall_recommendation"
                value={
                    workstream?.overall_recommendation
                        ? workstream.overall_recommendation
                        : ""
                }
                onSave={updateField}
                multiline={true}
            />
        </div>
    );
}
