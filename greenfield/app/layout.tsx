import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Innovation Co-pilot",
    description: "Greenfield project",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased items-center justify-items-center bg-gradient-to-r from-purple-500 to-blue-500`}
            >
                <div className="flex flex-col h-screen items-center justify-center font-sans min-h-screen w-full">
                    <main className="flex-[9] flex flex-col justify-center items-center sm:items-start w-full">
                        {children}
                    </main>
                    <footer className="flex-[1] row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                        A prototype.
                    </footer>
                </div>
            </body>
        </html>
    );
}
