"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/(auth)/dashboard/components/Sidebar/Sidebar";
import Header from "@/app/(auth)/dashboard/components/Header/Header";
import Footer from "@/app/(auth)/dashboard/components/Footer/Footer";
import styles from './page.module.scss';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    setIsAuth(true);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    if (!isAuth) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
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
        <div className={`flex min-h-screen overflow-hidden ${styles.dashboardBg} font-sans text-slate-900`}>
            <Sidebar />

            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <Header />

                <div className="flex-1">
                    {children}
                </div>

                <Footer />
            </main>
        </div>
    );
}