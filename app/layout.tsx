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
        </head>
        <body className="flex flex-col min-h-screen w-full">
        {children}
        </body>
        </html>
    );
}