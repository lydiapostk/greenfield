"use client";

import Icon from "@/components/icon/icon";
// import Icon from "@/components/icon/search";
import TextInputField from "@/components/input-field/input-text-field";
import { useState } from "react";

export default function LookupStartupInfo() {
    const [startupURL, setStartupURL] = useState<string>("");

    return (
        <div className="flex flex-col self-center justify-center items-center w-full">
            <TextInputField
                value={startupURL}
                setValue={setStartupURL}
                className=" w-3/5 py-3 px-3 gap-3"
                placeholder="Find start-up by its website..."
                leftIcon={<Icon name={"search"} size={"md"} color="blue" />}
                rightIcon={
                    startupURL == "" ? undefined : (
                        <Icon
                            name={"arrowRight"}
                            size={"md"}
                            color="blue"
                            className="hover:stroke-[2]"
                            onClick={() => {
                                console.log(
                                    `Search for start-up ${startupURL}`
                                );
                            }}
                        />
                    )
                }
            />
        </div>
    );
}
