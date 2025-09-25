import { components } from "@/app/types/api";

export type StartupType = components["schemas"]["Startup"];

export interface UserType {
    id: number;
    name: string;
    role: string;
    email: string;
}

interface StartupPreviewType
    extends Pick<
        StartupType,
        "id" | "company_name" | "founders" | "company_website"
    > {}
