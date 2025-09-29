import EditableTextField from "@/components/input-field/editable-text-field";
import { useRef, useState } from "react";
import {
    StartupStringParams,
    StartupType,
    ListOfYearsAsString,
    numEmployeesLabels,
    fundingRaisedLabels,
    fundingStageLabels,
} from "./startup-data-type";
import ExpandableSection from "./collapsible-section";
import {
    citation,
    parseCitationDictToList,
    parseCitationListToDict,
} from "./citation";
import EditableDropdownField from "@/components/input-field/editable-dropdown-field";
import { COUNTRIES } from "./countries";
import EditableDictionaryField, {
    DictionaryEntry,
} from "@/components/input-field/editable-dictionary-field";

interface StartupEditFormProps {
    startup: StartupType;
    setStartup: (startup: StartupType) => void;
}

export default function StartupEditForm({
    startup,
    setStartup,
}: StartupEditFormProps) {
    const [error, setError] = useState<string>("");
    const years_option = ListOfYearsAsString(1950, 2025);

    const updateField = (
        field: keyof StartupType,
        value: string | string[]
    ) => {
        if (!startup.id) return;
        const startup_update: Record<string, number | string | string[]> = {
            id: startup.id,
        };
        if (typeof value == "string") startup_update[field] = value.trim();
        else startup_update[field] = value;
        // TODO: implement support for other kinds of fields
        console.log(startup_update);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/startups/update/by_id`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(startup_update),
        })
            .then((res) =>
                res.json().then((data: StartupType) => {
                    setStartup(data);
                })
            )
            .catch((error) =>
                setError(
                    `Unexpected error occured when updating start-up!\n${error}`
                )
            );
    };

    const techInfoExpansion = ExpandableSection(citation(startup, "tech"));
    const uvpInfoExpansion = ExpandableSection(citation(startup, "uvp"));

    return (
        <div className="flex flex-col justify-start items-start w-full space-y-8">
            <EditableTextField
                label="Company Name"
                field_key="company_name"
                value={startup.company_name}
                onSave={updateField}
                fontStyle="text-3xl font-bold pb-10"
                showLabel={false}
            />

            <div className="grid grid-cols-2 justify-between gap-1 w-full">
                <div className="flex flex-col justify-start w-full gap-2">
                    {startup.company_website && (
                        <a
                            href={startup.company_website}
                            target="_blank"
                            className="relative flex flex-row justify-start cursor-pointer gap-2"
                        >
                            <span className="font-bold min-w-fit">
                                Company website:
                            </span>
                            <p className="rounded w-full hover:text-indigo-900 hover:underline">
                                {startup.company_website}
                            </p>
                        </a>
                    )}
                    <EditableDropdownField
                        label="Country:"
                        field_key="country"
                        value={startup.country ? startup.country : ""}
                        onSave={updateField}
                        values={COUNTRIES}
                        searchable={true}
                    />
                </div>
                <div className="flex flex-col justify-start w-full gap-2">
                    <EditableDropdownField
                        label="Year founded:"
                        field_key="year_founded"
                        value={startup.year_founded ? startup.year_founded : ""}
                        onSave={updateField}
                        values={years_option}
                    />
                    <EditableDropdownField
                        label="No. employees:"
                        field_key="num_employees"
                        value={
                            startup.num_employees ? startup.num_employees : ""
                        }
                        onSave={updateField}
                        values={numEmployeesLabels}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 justify-between gap-1 w-full mb-1">
                <EditableDropdownField
                    label="Funds raised:"
                    field_key="funds_raised"
                    value={startup.funds_raised ? startup.funds_raised : ""}
                    onSave={updateField}
                    values={fundingRaisedLabels}
                />
                <EditableDropdownField
                    label="Funding stage:"
                    field_key="funding_stage"
                    value={startup.funding_stage ? startup.funding_stage : ""}
                    onSave={updateField}
                    values={fundingStageLabels}
                />
            </div>
            <EditableDictionaryField
                field_key={"ref_funding"}
                label={"References:"}
                value={
                    startup.ref_funding
                        ? parseCitationListToDict(startup.ref_funding)
                        : []
                }
                onSave={function (
                    field: "ref_funding",
                    value: DictionaryEntry[]
                ): void {
                    updateField(field, parseCitationDictToList(value));
                }}
            />

            <div className="flex flex-col whitespace-nowrap justify-start w-full gap-1">
                <EditableDropdownField
                    label="TRL:"
                    field_key="trl"
                    value={startup.trl ? startup.trl : ""}
                    onSave={updateField}
                    values={numEmployeesLabels}
                />
                <EditableTextField
                    label={"Explanation:"}
                    field_key={"trl_explanation"}
                    value={
                        startup.trl_explanation ? startup.trl_explanation : ""
                    }
                    onSave={updateField}
                    multiline={true}
                />
            </div>
        </div>
    );
}
