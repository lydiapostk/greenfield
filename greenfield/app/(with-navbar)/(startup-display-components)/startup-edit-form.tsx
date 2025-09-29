import EditableTextField from "@/components/input-field/editable-text-field";
// import EditableListField, { ListItem } from "./EditableListField";
import { useRef, useState } from "react";
import { StartupStringParams, StartupType } from "./startup-data-type";
import Icon from "@/components/icon/icon";
import ExpandableSection from "./collapsible-section";
import { refInfo, textOrUnknown } from "./refs";

interface StartupEditFormProps {
    startup: StartupType;
    setStartup: (startup: StartupType) => void;
}

export default function StartupEditForm({
    startup,
    setStartup,
}: StartupEditFormProps) {
    const [error, setError] = useState<string>("");

    const updateField = (field: keyof StartupType, value: string) => {
        if (!startup.id) return;
        const startup_update: Record<string, number | string> = {
            id: startup.id,
        };
        if (StartupStringParams.includes(field))
            startup_update[field] = value.trim();
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

    const fundAndTRLSectionRef = useRef<(() => void) | null>(null);

    const trlExplanation = (
        <div className="pb-6">
            <h4 className="italic">How was TRL estimated?</h4>{" "}
            <p className="font-mono">{startup.trl_explanation}</p>
        </div>
    );

    const fundInfoExpansion = ExpandableSection(
        refInfo(startup, "fund"),
        fundAndTRLSectionRef
    );
    const trlExpansion = ExpandableSection(
        trlExplanation,
        fundAndTRLSectionRef
    );
    const techInfoExpansion = ExpandableSection(refInfo(startup, "tech"));
    const uvpInfoExpansion = ExpandableSection(refInfo(startup, "uvp"));

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
                    <EditableTextField
                        label="Country:"
                        field_key="country"
                        value={startup.country ? startup.country : ""}
                        onSave={updateField}
                    />
                </div>
                <div className="flex flex-col justify-start w-full gap-2">
                    <EditableTextField
                        label="Year founded:"
                        field_key="year_founded"
                        value={startup.year_founded ? startup.year_founded : ""}
                        onSave={updateField}
                    />
                    <EditableTextField
                        label="No. employees:"
                        field_key="num_employees"
                        value={
                            startup.num_employees ? startup.num_employees : ""
                        }
                        onSave={updateField}
                    />
                </div>
            </div>
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
            {fundInfoExpansion.component}
            {trlExpansion.component}
        </div>
    );
}
