"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Sidebar from "@/app/(auth)/dashboard/components/Sidebar/Sidebar";
import Header from "@/app/(auth)/dashboard/components/Header/Header";
import Footer from "@/app/(auth)/dashboard/components/Footer/Footer";
import styles from './page.module.scss';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error('Not authorized');
        (error as any).info = errorData;
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { error, isLoading } = useSWR('/api/auth/me', fetcher, {
        refreshInterval: 120000,
        revalidateOnFocus: true,
        shouldRetryOnError: false
    });

    const isBlocked = error?.status === 403 && error?.info?.is_block;

    if (error && !isBlocked) {
        router.push('/login');
        return null;
    }

    if (isBlocked) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-red-100 text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center border-4 border-red-100">
                        <span className="material-symbols-outlined text-5xl">lock_person</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Доступ приостановлен
                        </h2>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            Ваша учетная запись была заблокирована администратором системы. Вы больше не можете просматривать обучающие материалы.
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={async () => {
                                try {
                                    await fetch('/api/auth/logout', { method: 'POST' });
                                } catch (e) {

                                } finally {
                                    router.push('/login');
                                }
                            }}
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Вернуться ко входу
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6 font-sans">
                <div className="relative flex items-center justify-center w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-blue-700 animate-spin"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-700/30">
                        <span className="material-symbols-outlined text-4xl">school</span>
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Руна С Обучение
                    </h2>
                    <p className="text-sm font-medium text-blue-700 animate-pulse">
                        Загрузка платформы...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen overflow-hidden ${styles.dashboardBg} font-sans text-slate-900 relative`}>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

            <main className="flex-1 md:ml-64 min-h-screen flex flex-col w-full min-w-0">

                <Header setIsOpen={setIsMobileMenuOpen} />

                <div className="flex-1 p-4 md:p-0">
                    {children}
                </div>

                <Footer />
            </main>
        </div>
    );
}