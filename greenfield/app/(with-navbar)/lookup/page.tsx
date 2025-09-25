"use client";

import { paths } from "@/app/types/api"; // generated from openapi-typescript
import Icon from "@/components/icon/icon";
import TextInputField from "@/components/input-field/input-text-field";
import { useState } from "react";

type DomainCheckResponse =
    paths["/check-domain/"]["get"]["responses"]["200"]["content"]["application/json"];

export default function LookupStartupInfo() {
    const [startupURL, setStartupURL] = useState<string>("");
    const [error, setError] = useState<string>("");

    const onSearch = () => {
        if (startupURL !== "") {
            fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/check-domain/?url=${encodeURIComponent(startupURL)}`
            ).then((res) =>
                res.json().then((data: DomainCheckResponse) => {
                    console.log(data);
                    data.error && setError(data.error);
                    data.normalized && setStartupURL(data.normalized);
                    if (data.exists) {
                        console.log(`Search for start-up ${startupURL}`);
                    }
                })
            );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    return (
        <div className="flex flex-col self-center justify-center items-center w-full">
            <TextInputField
                value={startupURL}
                setValue={setStartupURL}
                className=" w-3/5 py-3 px-3 gap-3"
                onKeyDown={handleKeyDown}
                placeholder="Find start-up by its website..."
                error={error}
                leftIcon={<Icon name={"search"} size={"md"} color="blue" />}
                rightIcon={
                    <Icon
                        name={"arrowRight"}
                        size={"md"}
                        color="blue"
                        onClick={onSearch}
                        className={`hover:stroke-[2] transition ease-in-out delay-100 duration-300 ${
                            startupURL == "" ? "opacity-0" : "opacity-100"
                        }`}
                    />
                }
            />
        </div>
    );
}
