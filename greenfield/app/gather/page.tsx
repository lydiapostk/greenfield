"use client";

import Icon from "@/components/icon/icon";
// import Icon from "@/components/icon/search";
import TextInputField from "@/components/input-field/input-text-field";

export default function GatherStartupInfo() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <TextInputField
                className=" w-3/5"
                leftIcon={<Icon name={"search"} size={"md"} color="indigo" />}
            />
        </div>
    );
}
