"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminFooter() {
    const { data: settings } = useSWR('/api/settings', fetcher);

    const platformName = settings?.platformName || 'Руна С Обучение';
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto py-6 px-4 md:py-8 md:px-10 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center gap-4 md:gap-0 text-slate-400 border-t border-slate-200 bg-white">
            <p className="text-xs font-medium text-center md:text-left">
                © {currentYear} {platformName}. Система управления.
            </p>
            <p className="text-xs font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                Система работает стабильно
            </p>
        </footer>
    );
}