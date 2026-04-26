import type { Metadata } from "next";
import "./globals.css";

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
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
        </head>
        <body className="flex flex-col min-h-screen w-full">
        {children}
        </body>
        </html>
    );
}