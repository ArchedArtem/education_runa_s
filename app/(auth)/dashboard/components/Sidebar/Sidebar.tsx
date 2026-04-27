"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [hasAdminAccess, setHasAdminAccess] = useState(false);
    const [companyName, setCompanyName] = useState<string | null>(null);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname, setIsOpen]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();

                    if (data.user) {
                        if (data.user.company_name) {
                            setCompanyName(data.user.company_name);
                        }

                        if (data.user.role.name === 'Admin' || data.user.role.name === 'Moderator') {
                            setHasAdminAccess(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Ошибка при получении данных пользователя:", error);
                setHasAdminAccess(false);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            router.push('/');
            router.refresh();
        }
    };

    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        return isActive
            ? "flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 font-semibold border-r-4 border-blue-700 bg-blue-50 transition-all duration-200"
            : "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200";
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white flex flex-col py-8 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="px-6 mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-blue-700 leading-none">Руна С</h2>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Обучение</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-sm">Дашборд</span>
                </Link>
                <Link href="/dashboard/courses" className={getLinkClass("/dashboard/courses")}>
                    <span className="material-symbols-outlined">auto_stories</span>
                    <span className="text-sm">Каталог курсов</span>
                </Link>
                <Link href="/dashboard/tests" className={getLinkClass("/dashboard/tests")}>
                    <span className="material-symbols-outlined">quiz</span>
                    <span className="text-sm">Тестирования</span>
                </Link>
                <Link href="/dashboard/settings" className={getLinkClass("/dashboard/settings")}>
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm">Настройки</span>
                </Link>
            </nav>

            <div className="px-4 mt-auto pt-4 border-t border-slate-100">
                {hasAdminAccess && (
                    <Link
                        href="/admin/dashboard"
                        className="mb-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 shadow-md shadow-slate-900/10"
                    >
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <span className="text-sm font-bold">В админ-панель</span>
                    </Link>
                )}

                {companyName && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Организация</p>
                        <p className="text-sm font-bold text-slate-900 truncate" title={companyName}>
                            {companyName}
                        </p>
                    </div>
                )}

                <button onClick={handleLogout} className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Выйти</span>
                </button>
            </div>
        </aside>
    );
}