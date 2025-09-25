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
    const [loading, setLoading] = useState(false);

    const onSearch = () => {
        if (startupURL !== "") {
            setLoading(true);
            fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/check-domain/?url=${encodeURIComponent(startupURL)}`
            )
                .then((res) =>
                    res.json().then((data: DomainCheckResponse) => {
                        setLoading(false);
                        console.log(data);
                        data.error && setError(data.error);
                        data.normalized && setStartupURL(data.normalized);
                        if (data.exists) {
                            setError("");
                            console.log(`Search for start-up ${startupURL}`);
                        }
                    })
                )
                .catch((error) => {
                    setLoading(false);
                    setError(`Unexpected error: ${error}`);
                });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    return (
        <div className="flex flex-col self-center justify-center items-center w-full h-full">
            <div className="min-w-3/5">
                <TextInputField
                    value={startupURL}
                    setValue={setStartupURL}
                    className="w-full py-3 px-3 gap-3"
                    onKeyDown={handleKeyDown}
                    placeholder="Find start-up by its website..."
                    error={error}
                    leftIcon={<Icon name={"search"} size={"md"} color="blue" />}
                    rightIcon={
                        <div className="relative">
                            <Icon
                                name={"arrowRight"}
                                size={"md"}
                                color="blue"
                                onClick={onSearch}
                                className={`hover:stroke-[2] transition ease-in-out delay-100 duration-300 ${
                                    startupURL == "" || loading
                                        ? "opacity-0"
                                        : "opacity-100"
                                }`}
                            />
                            <Icon
                                name={"spinner"}
                                size={"md"}
                                color="blue"
                                onClick={onSearch}
                                style={{ pointerEvents: "none" }}
                                className={`absolute inset-0  text-stone-200 fill-indigo-600  transition ease-in-out delay-100 duration-300 ${
                                    loading ? "opacity-100" : "opacity-0"
                                }`}
                            />
                        </div>
                    }
                    disabled={loading}
                />
            </div>
        </div>
    );
}
