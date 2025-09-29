import { components } from "@/app/types/api";

export type StartupType = components["schemas"]["Startup"];
export type StartupUpdateType = components["schemas"]["StartupUpdate"];

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
