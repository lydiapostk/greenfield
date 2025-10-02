import Icon from "@/components/icon/icon";
import EditableDictionaryField, {
    DictionaryEntry,
} from "@/components/input-field/editable-dictionary-field";
import { StartupType, verifyInputIsURL } from "./data-type";

export const textOrUnknown = (text: string | undefined | null) =>
    text ? text : <p className="text-gray-700">Unknown</p>;

export const textOrToBeFilled = (text: string | undefined | null) =>
    text ? text : <p className="text-gray-700">To be filled.</p>;

const parseCitationText: (refText: string) => {
    text: string;
    href: string | undefined;
} = (refText: string) => {
    // Match text before parentheses and the URL inside
    const match = refText.match(/^(.*?)\s*\((https?:\/\/)?([^)\s]+)\)\.?$/);
    // fallback if format doesn’t match
    if (!match) return { text: refText, href: undefined };

    const [, text, protocol, url] = match;
    const href = `${protocol ?? "https://"}${url}`;

    return { text: text, href: href };
};

export function parseCitationListToDict(
    citation_list: string[]
): DictionaryEntry[] {
    return citation_list.map((cit) => {
        // Match "something (inside)"
        const parsedText = parseCitationText(cit);
        const text = parsedText.text.trim();
        const href = parsedText.href ? parsedText.href.trim() : undefined;
        return { key: text, value: href };
    });
}

export function parseCitationDictToList(
    citation_dict: DictionaryEntry[]
): string[] {
    return citation_dict.map((cit) =>
        cit.value && cit.value != ""
            ? `${cit.key} (${cit.value})`
            : `${cit.key}`
    );
}

export type citationTypeType = "ref_funding" | "ref_tech" | "ref_uvp";

export const getCitationAsElement = (
    startup: StartupType,
    citationType: citationTypeType
) => {
    let refInfo = startup[citationType as keyof StartupType];

    if (!refInfo) {
        return (
            <div>
                <h4>References</h4>
                None
            </div>
        );
    }

    refInfo = refInfo as string[];
    return (
        <div className="pb-6">
            <h4 className="italic">References</h4>
            <ul className="list-disc pl-5">
                {refInfo.map((refText, idx) => {
                    const parsedText = parseCitationText(refText);
                    const text = parsedText.text;
                    const href = parsedText.href;
                    return (
                        <a
                            key={idx}
                            href={href ? href : ""}
                            target={href ? "_blank" : ""}
                            className={
                                href
                                    ? "hover:text-indigo-900 hover:underline"
                                    : ""
                            }
                        >
                            <li>
                                <span className="break-words font-mono">
                                    {text}
                                </span>
                                {href && (
                                    <Icon
                                        name={"arrowTopRight"}
                                        size={"sm"}
                                        className="inline-block align-text-bottom pl-1"
                                    />
                                )}
                            </li>
                        </a>
                    );
                })}
            </ul>
        </div>
    );
};

async function verifyCitationRefIsValid(
    citation: DictionaryEntry,
    setError: (error: string) => void
): Promise<boolean> {
    if (!citation.value || citation.value == "") return true;
    return await verifyInputIsURL(citation.value, setError);
}

export const getCitationAsEditableElement = (
    startup: StartupType,
    citationType: citationTypeType,
    updateField: (field: keyof StartupType, value: string | string[]) => void
) => {
    return (
        <EditableDictionaryField
            field_key={citationType}
            label={"References:"}
            value={
                startup[citationType]
                    ? parseCitationListToDict(startup[citationType])
                    : []
            }
            onSave={function (
                field: citationTypeType,
                value: DictionaryEntry[]
            ): void {
                updateField(field, parseCitationDictToList(value));
            }}
            checkData={verifyCitationRefIsValid}
        />
    );
};
