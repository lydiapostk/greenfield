import Icon from "@/components/icon/icon";
import { StartupType } from "./startup-data-type";

const textOrUnknown = (text: string | undefined | null) =>
    text ? text : <p className="text-gray-700">Unknown</p>;

const parseRefText: (refText: string) => {
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

export type refInfoTypeType = "fund" | "tech" | "uvp";

export const refInfo = (startup: StartupType, refInfoType: refInfoTypeType) => {
    const refInfo = (() => {
        switch (refInfoType) {
            case "fund":
                return startup.ref_funding;
            case "tech":
                return startup.ref_tech;
            case "uvp":
                return startup.ref_uvp;
        }
    })();

    if (!refInfo) {
        return (
            <div>
                <h4>References</h4>
                None
            </div>
        );
    }

    return (
        <div className="pb-6">
            <h4 className="italic">References</h4>
            <ul className="list-disc pl-5">
                {refInfo.map((refText, idx) => {
                    const parsedText = parseRefText(refText);
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
