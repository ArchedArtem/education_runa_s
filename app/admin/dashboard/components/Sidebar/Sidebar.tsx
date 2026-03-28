"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            router.push('/admin/login');
            router.refresh();
        }
    };

    const getLinkClass = (path: string) => {
        const isActive = path === '/admin/dashboard'
            ? pathname === path
            : pathname === path || pathname.startsWith(`${path}/`);

        return isActive
            ? "flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold bg-blue-700 shadow-lg shadow-blue-700/20 transition-all duration-200"
            : "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200";
    };

    return (
        <aside className="fixed h-screen w-64 left-0 bg-slate-900 flex flex-col py-8 z-50 shadow-2xl shadow-slate-900/50">
            <div className="px-6 mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-inner">
                        <span className="material-symbols-outlined text-2xl text-blue-500">shield</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white leading-none">Руна С</h2>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Админ-панель</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                <Link href="/admin/dashboard" className={getLinkClass("/admin/dashboard")}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-sm">Обзор</span>
                </Link>
                <Link href="/admin/dashboard/users" className={getLinkClass("/admin/dashboard/users")}>
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-sm">Пользователи</span>
                </Link>
                <Link href="/admin/dashboard/courses" className={getLinkClass("/admin/dashboard/courses")}>
                    <span className="material-symbols-outlined">menu_book</span>
                    <span className="text-sm">Курсы и Уроки</span>
                </Link>
                <Link href="/admin/dashboard/tests" className={getLinkClass("/admin/dashboard/tests")}>
                    <span className="material-symbols-outlined">quiz</span>
                    <span className="text-sm">База тестов</span>
                </Link>
            </nav>

            <div className="px-4 mt-auto">
                <button
                    onClick={handleLogout}
                    className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Выйти из системы</span>
                </button>
            </div>
        </aside>
    );
}