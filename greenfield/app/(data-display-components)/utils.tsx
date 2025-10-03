import { WorkstreamReadType, WorkstreamUpsertType } from "./data-type";

export const textOrUnknown = (text: string | undefined | null) =>
    text ? text : <p className="text-gray-700">Unknown</p>;

export const textOrToBeFilled = (text: string | undefined | null) =>
    text ? text : <p className="text-gray-700">To be filled.</p>;

interface deleteFromDBParams {
    type: "startups" | "workstreams";
    idsToDel: number[];
    setIsLoading: (isLoading: boolean) => void;
    setIsDelModalOpen?: (isOpen: boolean) => void;
    setError?: (errMsg: string) => void;
    onSuccess?: () => void;
}

export function deleteFromDB({
    type,
    idsToDel,
    setIsLoading,
    setIsDelModalOpen = () => {},
    setError = () => {},
    onSuccess = () => {},
}: deleteFromDBParams) {
    setIsLoading(true);
    setIsDelModalOpen(false);
    setError("");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/${type}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(idsToDel),
    })
        .then((res) =>
            res.json().then((data) => {
                if (!res.ok || !data.deleted) {
                    setIsDelModalOpen(true);
                    setError(
                        `Error occurred during deletion: ${res.statusText}`
                    );
                } else {
                    onSuccess();
                }
            })
        )
        .catch((e: unknown) => {
            setIsDelModalOpen(true);
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Unexpected error");
            }
        })
        .finally(() => {
            setIsLoading(false);
        });
}

interface updateWSParams {
    workstream_id: number;
    updateWorkstream?: (ws: WorkstreamReadType) => void;
    setError?: (errMsg: string) => void;
}

export function getUpdateWSFunction({
    workstream_id,
    updateWorkstream = () => {},
    setError = () => {},
}: updateWSParams) {
    return (field: keyof WorkstreamUpsertType, value: string) => {
        const workstream_update: Record<string, string> = {};
        workstream_update[field] = value.trim();
        fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL
            }/workstreams/${encodeURIComponent(workstream_id)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(workstream_update),
            }
        )
            .then((res) =>
                res.json().then((data: WorkstreamReadType) => {
                    if (res.ok) updateWorkstream(data);
                    else
                        setError(
                            `Unexpected error occured when updating workstream!\n${res.statusText}`
                        );
                })
            )
            .catch((error) =>
                setError(
                    `Unexpected error occured when updating workstream!\n${error}`
                )
            );
    };
}
