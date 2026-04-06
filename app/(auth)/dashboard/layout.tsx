"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/app/(auth)/dashboard/components/Sidebar/Sidebar";
// import Header from "@/app/(auth)/dashboard/components/Header/Header";
import Footer from "@/app/(auth)/dashboard/components/Footer/Footer";
import styles from './page.module.scss';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');

                if (res.ok) {
                    setIsChecking(false);
                } else if (res.status === 403) {
                    const data = await res.json();
                    if (data.is_block) {
                        setIsBlocked(true);
                        setIsChecking(false);
                    } else {
                        router.push('/login');
                    }
                } else {
                    router.push('/login');
                }
            } catch (error) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router, pathname]);

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
                                    console.error("Ошибка при выходе:", e);
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

    if (isChecking) {
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

                <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-lg">school</span>
                        </div>
                        <span className="font-bold text-blue-700 text-lg">Руна С</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-slate-500 hover:text-slate-900 p-1"
                    >
                        <span className="material-symbols-outlined text-3xl">menu</span>
                    </button>
                </div>

                {/* <Header /> */}

                <div className="flex-1 p-4 md:p-0">
                    {children}
                </div>

                <Footer />
            </main>
        </div>
    );
}