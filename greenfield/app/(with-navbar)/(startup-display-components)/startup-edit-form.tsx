import EditableTextField from "@/components/input-field/editable-text-field";
// import EditableListField, { ListItem } from "./EditableListField";
import { useState } from "react";
import { StartupType } from "./startup-data-type";

interface StartupEditFormProps {
    startup: StartupType;
}

export default function StartupEditForm({ startup }: StartupEditFormProps) {
    const updateField = (field: string, value: string) => {
        // setStartup((prev) => ({ ...prev, [field]: value }));
        // TODO: SOMETHING
    };

    return (
        <div className="flex flex-col justify-start items-start w-full space-y-8">
            <EditableTextField
                label="Company Name"
                value={startup.company_name}
                onSave={() => {}}
                disabled
            />
            <EditableTextField
                label="Website"
                value={startup.company_website ? startup.company_website : ""}
                onSave={() => {}}
                disabled
            />
        </div>
    );
}
