import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "scout.",
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
                className={`${inter.variable} antialiased items-center min-h-fit justify-items-center bg-gradient-to-r from-purple-500 to-blue-500`}
            >
                <div className="flex flex-col justify-center font-sans min-h-screen w-full">
                    <main className="flex-1 flex flex-col sm:items-start w-full">
                        {children}
                    </main>
                    <div className="py-[3px] self-center">
                        <footer>A prototype.</footer>
                    </div>
                </div>
            </body>
        </html>
    );
}
