"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

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
        <aside className="fixed h-screen w-64 left-0 border-r border-slate-200 bg-white flex flex-col py-8 z-50">
            <div className="px-6 mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-blue-700 leading-none">Руна С</h2>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Обучение</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
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

            <div className="px-4 mt-auto">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Организация</p>
                    <p className="text-sm font-bold text-slate-900 truncate">ООО Альфа-Трейд</p>
                </div>
                <button onClick={handleLogout} className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm">Выйти</span>
                </button>
            </div>
        </aside>
    );
}