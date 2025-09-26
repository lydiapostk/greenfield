"use client";

import { components } from "@/app/types/api"; // generated from openapi-typescript
import { typingEffect } from "@/components/animate-text";
import Icon from "@/components/icon/icon";
import TextInputField from "@/components/input-field/input-text-field";
import { useEffect, useState } from "react";
import { StartupType } from "../browse/startup-data-type";

type DomainCheckResponse = components["schemas"]["CheckDomainResponse"];

const lookupSteps = ["userInput", "checkURL", "dbCheck", "queryLLM"];
const lookupExplanations: { [step: LookupStep]: string } = {
    checkURL: "Validating url is a valid web page...",
    dbCheck: "Checking if database has a record for this startup...",
    queryLLM: "Looking up the internet to gather information...",
};
type LookupStep = (typeof lookupSteps)[number];

export default function LookupStartupInfo() {
    const [startupURL, setStartupURL] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [explanation, setExplanation] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<LookupStep>(lookupSteps[0]);

    const resetLookupStatus = (error: any) => {
        setLoading(false);
        setError(`Unexpected error: ${error}`);
        setStep(lookupSteps[0]);
    };

    const checkURL = async (url: string): Promise<string | null> => {
        setStep(lookupSteps[1]);
        try {
            const res = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/lookup/check_url?url=${encodeURIComponent(url)}`
            );

            const data: DomainCheckResponse = await res.json();

            if (data.exists && data.hostname) {
                setStartupURL(data.hostname);
                return data.hostname;
            }

            resetLookupStatus(data.error);
            return null;
        } catch (error) {
            resetLookupStatus(error);
            return null;
        }
    };

    const checkDB = async (url: string): Promise<StartupType[] | null> => {
        setStep(lookupSteps[2]);
        try {
            const res = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/startups/fetch/by_website?lookup_url=${encodeURIComponent(
                    url
                )}`
            );

            const data: StartupType[] = await res.json();
            return data;
        } catch (error) {
            resetLookupStatus(error);
            return null;
        }
    };

    const queryLLM = async (url: string): Promise<StartupType | null> => {
        setStep(lookupSteps[3]);
        try {
            const res = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/lookup/query_llm?startup_url=${encodeURIComponent(url)}`
            );

            const data: StartupType = await res.json();
            return data;
        } catch (error) {
            resetLookupStatus(error); // TODO: handle what happens if this fails (e.g. if a gaming page is sent instead.)
            return null;
        }
    };

    const onSearch = async () => {
        if (startupURL !== "") {
            setLoading(true);
            setError("");
            const normalisedURL = await checkURL(startupURL);
            if (!normalisedURL) return; // TODO: Implement website URL suggestion
            const maybeRecords = await checkDB(normalisedURL);
            if (!maybeRecords) return; // An error happened for some reason.
            if (maybeRecords.length > 0) {
                // TODO: display the list of suggested records...
                setLoading(false);
            } else {
                // const maybeRecord = await queryLLM(normalisedURL);
                setLoading(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    useEffect(() => {
        if (loading && step != lookupSteps[0]) {
            typingEffect(setExplanation, lookupExplanations[step], 0);
        } else {
            setExplanation("");
        }
    }, [loading, step]);

    return (
        <div className="flex flex-col self-center justify-center items-center w-full h-full">
            <h1 className="text-4xl pb-6 text-stone-200 font-bold mb-6">
                Lookup
            </h1>
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
                        </div>
                    }
                    disabled={loading}
                />
                {loading && (
                    <div className="flex flex-row align-start gap-3">
                        <Icon
                            name={"spinner"}
                            size={"md"}
                            color="blue"
                            onClick={onSearch}
                            style={{ pointerEvents: "none" }}
                            className={`text-stone-200 fill-indigo-600  transition ease-in-out delay-100 duration-300 ${
                                loading ? "opacity-100" : "opacity-0"
                            }`}
                        />
                        <div className="font-mono text-stone-200">
                            {explanation}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
