import { ReactElement, useState } from "react";

import Icon from "@/components/icon/icon";
import EditableTextField from "@/components/input-field/editable-text-field";
import EditableDropdownField from "@/components/input-field/editable-dropdown-field";
import EditableDictionaryField from "@/components/input-field/editable-dictionary-field";
import EditableListField from "@/components/input-field/editable-list-field";

import CollapsibleSection from "@/data_display/collapsible-section";
import { COUNTRIES } from "@/data_display/countries";
import { getCitationAsEditableElement } from "./citation";
import EditableCompetitorsField from "./editable-competitors";
import {
    ListOfYearsAsString,
    numEmployeesLabels,
    fundingRaisedLabels,
    fundingStageLabels,
    trlLabels,
    StartupFoundersType,
    verifyInputIsURL,
    StartupUpsertType,
    StartupReadType,
    StartupPropertyTypes,
} from "../data-type";
import { DictionaryEntry } from "@/components/input-field/types";

interface StartupEditFormProps {
    startup: StartupReadType;
    setStartup: (startup: StartupReadType) => void;
    topToolbar?: ReactElement;
    bottomToolbar?: ReactElement;
}

interface StartupEditFormExplanationProps {
    explanation_type:
        | "ref_funding"
        | "ref_tech"
        | "ref_uvp"
        | "trl_explanation";
    startup: StartupReadType;
    updateField: (
        field: keyof StartupUpsertType,
        value: string | string[]
    ) => void;
}

function StartupEditFormExplanation({
    explanation_type,
    startup,
    updateField,
}: StartupEditFormExplanationProps) {
    const explanationSection = (() => {
        if (explanation_type == "trl_explanation") {
            return CollapsibleSection(
                <EditableTextField
                    label={"Explanation:"}
                    field_key={"trl_explanation"}
                    value={
                        startup.trl_explanation ? startup.trl_explanation : ""
                    }
                    onSave={updateField}
                    multiline={true}
                />
            );
        } else {
            return CollapsibleSection(
                getCitationAsEditableElement(
                    startup,
                    explanation_type,
                    updateField
                )
            );
        }
    })();

    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

    return (
        <div className="w-full flex flex-col">
            <p
                onClick={() => {
                    explanationSection.controlFn();
                    setIsCollapsed(!isCollapsed);
                }}
                className="p-0 m-0 cursor-pointer italic font-semibold text-indigo-600 text-sm hover:underline"
            >
                {isCollapsed ? "See more" : "Show less"}
            </p>
            {explanationSection.component}
        </div>
    );
}

export default function StartupEditForm({
    startup,
    setStartup,
    topToolbar,
    bottomToolbar,
}: StartupEditFormProps) {
    const [error, setError] = useState<string>("");
    const currentYear = new Date().getFullYear();
    const years_option = ListOfYearsAsString(currentYear - 50, currentYear);

    const updateField = (
        field: keyof StartupUpsertType,
        value: StartupPropertyTypes,
        setIsEditing?: (isEditing: boolean) => void
    ) => {
        if (!startup.id) return;
        const startup_update: Record<string, StartupPropertyTypes> = {};
        if (typeof value == "string") {
            startup_update[field] = value.trim();
        } else startup_update[field] = value;
        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/startups/${encodeURIComponent(
                startup.id
            )}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(startup_update),
            }
        )
            .then((res) =>
                res.json().then((data: StartupReadType) => {
                    if (!res.ok)
                        setError(`Unxpected error occured: ${res.statusText}`);
                    else {
                        setStartup(data);
                        setIsEditing &&
                            setTimeout(() => {
                                setIsEditing(false); // delay exit edit mode, to give db time to update and display new value
                            }, 100);
                    }
                })
            )
            .catch((error) => setError(`Unexpected error occured:\n${error}`));
    };

    return (
        <div className="flex flex-col justify-start items-start mt-6 gap-4 w-full space-y-8 min-h-fit overflow-auto">
            {topToolbar}
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
            <EditableTextField
                label="Company Name"
                field_key="company_name"
                value={startup.company_name ? startup.company_name : ""}
                onSave={updateField}
                fontStyle="text-3xl font-bold mr-3"
                showLabel={false}
            />
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
            <div className="flex flex-col justify-start w-full gap-2">
                <EditableDropdownField
                    label="Country:"
                    field_key="country"
                    value={startup.country ? startup.country : ""}
                    onSave={updateField}
                    values={COUNTRIES}
                    searchable={true}
                />
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
                    value={startup.num_employees ? startup.num_employees : ""}
                    onSave={updateField}
                    values={numEmployeesLabels}
                />
            </div>

            <div className="flex flex-col whitespace-nowrap justify-start w-full gap-1">
                <EditableDropdownField
                    label="TRL:"
                    field_key="trl"
                    value={startup.trl ? startup.trl : ""}
                    onSave={updateField}
                    values={trlLabels}
                />
                <StartupEditFormExplanation
                    explanation_type={"trl_explanation"}
                    startup={startup}
                    updateField={updateField}
                />
            </div>

            <div className="grid grid-cols-2 justify-between gap-1 w-full mb-1 min-w-fit">
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

            <StartupEditFormExplanation
                explanation_type={"ref_funding"}
                startup={startup}
                updateField={updateField}
            />

            <div className="flex flex-col whitespace-nowrap justify-start w-full gap-1">
                <EditableTextField
                    label={"Technology Offering:"}
                    field_key={"tech_offering"}
                    value={startup.tech_offering ? startup.tech_offering : ""}
                    onSave={updateField}
                    multiline={true}
                    textAreaSize={"lg"}
                />
                <StartupEditFormExplanation
                    explanation_type={"ref_tech"}
                    startup={startup}
                    updateField={updateField}
                />
            </div>

            <div className="flex flex-col whitespace-nowrap justify-start w-full gap-1">
                <EditableTextField
                    label={"UVP:"}
                    field_key={"uvp"}
                    value={startup.uvp ? startup.uvp : ""}
                    onSave={updateField}
                    multiline={true}
                    textAreaSize={"lg"}
                />
                <StartupEditFormExplanation
                    explanation_type={"ref_uvp"}
                    startup={startup}
                    updateField={updateField}
                />
            </div>

            <EditableListField
                field_key={"use_cases"}
                label={"Use Cases:"}
                value={startup.use_cases ? startup.use_cases : []}
                onSave={updateField}
            />
            <EditableCompetitorsField
                field_key={"competitors"}
                label={"Competitors"}
                value={startup.competitors ? startup.competitors : []}
                onSave={updateField}
            />

            <EditableDictionaryField
                field_key={"founders"}
                label={"Founders:"}
                value={
                    startup.founders
                        ? Object.entries(startup.founders).map(
                              ([founder, maybeURL]) => {
                                  return {
                                      key: founder,
                                      value: maybeURL as string,
                                  };
                              }
                          )
                        : []
                }
                onSave={function (
                    field: "founders",
                    founders: DictionaryEntry[]
                ): void {
                    const foundersDict: StartupFoundersType = {};
                    founders.forEach((founder) => {
                        foundersDict[founder.key] =
                            founder.value && founder.value != ""
                                ? founder.value
                                : null;
                    });
                    console.log(foundersDict);
                    updateField(field, foundersDict);
                }}
                checkData={async (
                    founder: DictionaryEntry,
                    setError: (error: string) => void
                ) => {
                    if (founder.value && founder.value !== "")
                        return await verifyInputIsURL(founder.value, setError);
                    else return true;
                }}
            />
            <EditableListField
                field_key={"investors"}
                label={"Investors:"}
                value={startup.investors ? startup.investors : []}
                onSave={updateField}
            />
            {bottomToolbar}
        </div>
    );
}
