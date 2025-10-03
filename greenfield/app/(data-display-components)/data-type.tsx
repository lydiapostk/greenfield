import { components, operations } from "@/app/types/api";

export type StartupType = components["schemas"]["Startup"];
export type StartupReadType = components["schemas"]["StartupReadLite"];
export type StartupFoundersType = components["schemas"]["Startup"]["founders"];
export type CompetitorsType = components["schemas"]["Competitors"];
export type StartupPropertyTypes =
    | string
    | string[]
    | StartupFoundersType
    | CompetitorsType;

export type StartupUpsertType = components["schemas"]["StartupUpsert"];

export type WorkstreamType = components["schemas"]["WorkstreamReadLite"];
export type WorkstreamUpsertType = components["schemas"]["WorkstreamUpsert"];
export type WorkstreamCreateDisplayType = WorkstreamUpsertType & {
    startups: StartupReadType[];
};

export type DomainCheckResponse = components["schemas"]["CheckDomainResponse"];
export type BulkDeleteStartupsResponse =
    operations["delete_item_startups_by_ids_delete"]["responses"];

export const ListOfYearsAsString = (start: number, end: number) => {
    const years: string[] = [];
    for (let y = end; y >= start; y--) {
        years.push(y.toString());
    }
    return years;
};

export const fundingRaisedLabels: string[] = [
    "<$500K",
    "$500K-$1M",
    "$1M-$5M",
    "$5M-$10M",
    ">$10M",
];

export const fundingStageLabels: string[] = [
    "Conceptual",
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C",
    "Series D",
];

export const numEmployeesLabels: string[] = [
    "1-10",
    "11-50",
    "51-100",
    "101-1000",
    ">1000",
];

export const trlLabels: string[] = ["TRL 1-4", "TRL 5-7", "TRL 8-9"];

export async function verifyInputIsURL(
    maybeURL: string,
    setError: (error: string) => void
): Promise<boolean> {
    try {
        const res = await fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL
            }/lookup/check_url?url=${encodeURIComponent(maybeURL)}`
        );

        const data: DomainCheckResponse = await res.json();
        if (data.error) {
            setError(data.error);
        }

        return data.exists;
    } catch (error) {
        setError(error as string);
        return false;
    }
}
