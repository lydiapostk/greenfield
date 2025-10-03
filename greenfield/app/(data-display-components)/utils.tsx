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
