"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "./components/Sidebar/Sidebar";
import AdminHeader from "./components/Header/Header";
import AdminFooter from "./components/Footer/Footer";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkAdminAuth = async () => {
            try {
                const res = await fetch('/api/admin/auth/me');

                if (res.ok) {
                    setIsAdmin(true);
                    setIsChecking(false);
                } else {
                    router.push('/admin/login');
                }
            } catch (error) {
                router.push('/admin/login');
            }
        };

        checkAdminAuth();
    }, [router, pathname]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg">
                        <span className="material-symbols-outlined text-4xl text-blue-500">shield</span>
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Руна С • CMS
                    </h2>
                    <p className="text-sm font-medium text-slate-400 animate-pulse">
                        Загрузка админ-панели...
                    </p>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className="flex min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 animate-in fade-in duration-500 relative">

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <AdminSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

                <main className="flex-1 md:ml-64 min-h-screen flex flex-col w-full min-w-0 relative">
                    {/*<AdminHeader setIsOpen={setIsMobileMenuOpen} />*/}

                    <div className="flex-1 overflow-x-hidden p-4 md:p-0">
                        {children}
                    </div>

                    <AdminFooter />
                </main>
            </div>
        );
    }

    return null;
}