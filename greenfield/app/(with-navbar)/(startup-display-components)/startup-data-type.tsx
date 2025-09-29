import { components } from "@/app/types/api";

export type StartupType = components["schemas"]["Startup"];
export type StartupUpdateType = components["schemas"]["StartupUpdate"];
export type StartupFoundersType = components["schemas"]["Startup"]["founders"];

export const StartupStringParams: (keyof StartupUpdateType)[] = [
    /** Company Name */
    "company_name",
    /** Company Website */
    "company_website",
    /** Year Founded */
    "year_founded",
    /** Country */
    "country",
    /** Num Employees */
    "num_employees",
    /** Funding Stage */
    "funding_stage",
    /** Funds Raised */
    "funds_raised",
    /** Tech Offering */
    "tech_offering",
    /** Uvp */
    "uvp",
    /** Trl */
    "trl",
    /** Trl Explanation */
    "trl_explanation",
];

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

// founders?: components["schemas"]["Founders"] | null;
//     /** Investors */
//     investors?: string[] | null;
/** Ref Funding */
// ref_funding?: string[] | null;
// /** Ref Tech */
// ref_tech?: string[] | null;
// /** Tech Embedding */
// tech_embedding?: number[] | null;
// /** Ref Uvp */
// ref_uvp?: string[] | null;
// /** Uvp Embedding */
// uvp_embedding?: number[] | null;
