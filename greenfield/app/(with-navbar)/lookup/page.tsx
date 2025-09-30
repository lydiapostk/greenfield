"use client";

import { typingEffect } from "@/components/animate-text";
import Icon from "@/components/icon/icon";
import TextInputField from "@/components/input-field/input-text-field";
import { useEffect, useRef, useState } from "react";
import {
    StartupType,
    DomainCheckResponse,
} from "@/app/(startup-display-components)/startup-data-type";
import StartupTable from "@/app/(startup-display-components)/startup_table";
import StartupDrawer from "@/components/side_drawer";
import { useRouter } from "next/navigation";
import StartupView from "@/app/(startup-display-components)/startup_view";

const lookupSteps = [
    "userInput",
    "checkURL",
    "dbCheck",
    "foundDBRecords",
    "queryLLM",
    "redirectingToPage",
];
const lookupExplanations: { [step: LookupStep]: string } = {
    userInput: "",
    checkURL: "Validating url is a valid web page...",
    dbCheck: "Checking if database has a record for this startup...",
    foundDBRecords: "Is this what you are looking for...",
    queryLLM: "Looking up the internet to gather information...",
    redirectingToPage: "Found startup information, redirecting to page...",
};
type LookupStep = (typeof lookupSteps)[number];

export default function LookupStartupInfo() {
    const [step, setStep] = useState<LookupStep>(lookupSteps[0]);
    const [error, setError] = useState<string>("");
    const [explanation, setExplanation] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [startupURL, setStartupURL] = useState<string>("");
    const [suggestedRecord, setSuggestedRecord] = useState<StartupType | null>(
        null
    );
    const [showSideBar, setShowSideBar] = useState<boolean>(false);
    const typingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const resetLookupStatus = (error?: any) => {
        error && setError(`Unexpected error: ${error}`);
        setLoading(false);
        setStep(lookupSteps[0]);
        setSuggestedRecord(null);
        setShowSideBar(false);
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

            if (data.exists && (data.normalized || data.hostname)) {
                const validatedURL = data.normalized
                    ? data.normalized
                    : (data.hostname as string);
                setStartupURL(validatedURL);
                return validatedURL;
            }

            resetLookupStatus(data.error);
            return null;
        } catch (error) {
            resetLookupStatus(error);
            return null;
        }
    };

    const checkDB = async (url: string): Promise<StartupType | null> => {
        setStep(lookupSteps[2]);
        try {
            const res = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/startups/fetch/by_website?lookup_url=${encodeURIComponent(
                    url
                )}`
            );

            const data: StartupType = await res.json();
            return data;
        } catch (error) {
            resetLookupStatus(error);
            return null;
        }
    };

    const _queryLLM = async (url: string): Promise<StartupType | null> => {
        setStep(lookupSteps[4]);
        try {
            const res = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL
                }/lookup/query_llm?startup_url=${encodeURIComponent(url)}`
            );

            const data: StartupType | null = await res.json();
            if (!res.ok || !data) {
                resetLookupStatus("Internal server error happened!");
                return null;
            }
            return data;
        } catch (error) {
            resetLookupStatus(error); // TODO: handle what happens if this fails (e.g. if a gaming page is sent instead.)
            return null;
        }
    };

    const lookupStartupOnline = async (url: string) => {
        const startupRecord = await _queryLLM(url);
        startupRecord && confirmStartup(startupRecord);
    };
    const router = useRouter();
    const confirmStartup = (startup: StartupType) => {
        setStep(lookupSteps[5]);
        router.push(`/browse/${startup.id}`);
    };

    const onSearch = async () => {
        if (startupURL !== "") {
            setLoading(true);
            setError("");
            const normalisedURL = await checkURL(startupURL);
            if (!normalisedURL) return; // TODO: Implement website URL suggestion
            const maybeRecord = await checkDB(normalisedURL);
            setStep(lookupSteps[3]);
            if (maybeRecord) {
                setTimeout(() => {
                    setSuggestedRecord(maybeRecord); // Give the UI time to type out instructions before displaying result
                }, 300);
            } else {
                lookupStartupOnline(normalisedURL);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    useEffect(() => {
        typingEffect(
            setExplanation,
            lookupExplanations[step],
            typingInterval,
            10
        );
    }, [step]);

    return (
        <div className="flex flex-col self-center justify-center items-center w-full h-full">
            <h1 className="text-4xl pb-6 text-stone-200 font-bold mb-6">
                Lookup
            </h1>
            <div className="min-w-3/5 flex flex-col justify-start gap-3">
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
                    <div className="flex flex-col justify-start">
                        <div className="font-mono flex flex-row gap-2 pb-6 justify-start items-center text-stone-200">
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
                            {explanation}
                        </div>
                        {suggestedRecord && (
                            <div className="flex flex-col justify-start gap-3">
                                <div className="flex flex-row justify-start items-center gap-3">
                                    <Icon
                                        name={"tick"}
                                        size={"md"}
                                        className="hover:stroke-[2] transition ease-in-out delay-100 duration-300"
                                        onClick={() => {
                                            confirmStartup(suggestedRecord);
                                        }}
                                    />
                                </div>
                                <StartupTable
                                    startups={[suggestedRecord]}
                                    onClickStartup={() => {
                                        setShowSideBar(!showSideBar);
                                    }}
                                />
                            </div>
                        )}
                        {suggestedRecord && showSideBar && (
                            <StartupDrawer
                                onClose={() => setShowSideBar(!showSideBar)}
                            >
                                <StartupView startup={suggestedRecord} />
                            </StartupDrawer>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
