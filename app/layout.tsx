import type { Metadata } from "next";
import "./globals.css";
// import { SpeedInsights } from "@vercel/speed-insights/next";
// import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
    title: "Обучение Руна С",
    description: "Платформа дистанционного обучения клиентов 1С",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
        <head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
        </head>
        <body className="flex flex-col min-h-screen w-full">
        {children}
        {/*<SpeedInsights />*/}
        {/*<Analytics />*/}
        </body>
        </html>
    );
}