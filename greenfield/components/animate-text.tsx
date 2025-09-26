import { useRef } from "react";

function _resetTypingInterval(
    typingIntervalRef?: React.RefObject<ReturnType<typeof setInterval> | null>
) {
    if (!typingIntervalRef?.current) return;
    clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = null;
}

export function typingEffect(
    setText: (text: string) => void,
    fullText: string,
    typingSpeed: number = 300,
    typingIntervalRef?: React.RefObject<ReturnType<typeof setInterval> | null>
) {
    _resetTypingInterval(typingIntervalRef);
    typingIntervalRef = typingIntervalRef
        ? typingIntervalRef
        : useRef<ReturnType<typeof setInterval> | null>(null);
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) {
            _resetTypingInterval(typingIntervalRef);
        }
    }, typingSpeed);
}
