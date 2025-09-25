export function typingEffect(
    setText: (text: string) => void,
    fullText: string
): () => void {
    let i = 0;
    const interval = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) clearInterval(interval);
    }, 300); // typing speed
    return () => clearInterval(interval);
}
