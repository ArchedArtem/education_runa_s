import type {Metadata} from "next";
import "../globals.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

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
        <body className="flex flex-col min-h-screen">
        <main className="flex-grow">
            {children}
        </main>
        </body>
        </html>
    );
}