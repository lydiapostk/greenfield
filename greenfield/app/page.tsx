import NavButton from "@/components/nav-button";

export default function Home() {
    return (
        <div className="flex gap-4 items-center flex-col sm:flex-row">
            <NavButton title="Try it now" href="/" />
        </div>
    );
}
