"use client";

import Icon from "@/components/icon/icon";
// import Icon from "@/components/icon/search";
import TextInputField from "@/components/input-field/input-text-field";
import { useState } from "react";

export default function LookupStartupInfo() {
    const [startupURL, setStartupURL] = useState<string>("");

    const onSearch = () => {
        if (startupURL !== "") {
            console.log(`Search for start-up ${startupURL}`);
        }
    };

    return (
        <div className="flex flex-col self-center justify-center items-center w-full">
            <TextInputField
                value={startupURL}
                setValue={setStartupURL}
                className=" w-3/5 py-3 px-3 gap-3"
                placeholder="Find start-up by its website..."
                leftIcon={<Icon name={"search"} size={"md"} color="blue" />}
                rightIcon={
                    <Icon
                        name={"arrowRight"}
                        size={"md"}
                        color="blue"
                        className={`hover:stroke-[2] transition ease-in-out delay-100 duration-300 ${
                            startupURL == "" ? "opacity-0" : "opacity-100"
                        }`}
                        onClick={onSearch}
                    />
                }
            />
        </div>
    );
}
