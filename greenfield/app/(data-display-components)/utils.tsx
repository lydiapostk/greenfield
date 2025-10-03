export const textOrUnknown = (text: string | undefined | null) =>
    text ? text : <p className="text-gray-700">Unknown</p>;

export const textOrToBeFilled = (text: string | undefined | null) =>
    text ? text : <p className="text-gray-700">To be filled.</p>;
