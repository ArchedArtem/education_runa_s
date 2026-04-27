"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
    setIsOpen: (isOpen: boolean) => void;
}

type AdminProfile = {
    firstName: string;
    lastName: string;
    roleName: string;
};

const ADMIN_PAGES = [
    { title: "Дашборд (Обзор)", path: "/admin/dashboard", icon: "dashboard", type: "Раздел" },
    { title: "Пользователи и клиенты", path: "/admin/dashboard/users", icon: "group", type: "Раздел" },
    { title: "Каталог курсов и уроков", path: "/admin/dashboard/courses", icon: "menu_book", type: "Раздел" },
    { title: "Создать новый курс", path: "/admin/dashboard/courses/new", icon: "add_circle", type: "Действие", requiresAdmin: true },
    { title: "База тестов", path: "/admin/dashboard/tests", icon: "quiz", type: "Раздел" },
    { title: "Статистика", path: "/admin/dashboard/statistic", icon: "bar_chart", type: "Раздел" },
    { title: "Настройки (Клиентские)", path: "/dashboard/settings", icon: "settings", type: "Раздел" }
];

export default function AdminHeader({ setIsOpen }: AdminHeaderProps) {
    const [admin, setAdmin] = useState<AdminProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch('/api/admin/auth/me', { headers });
                if (res.ok) {
                    const data = await res.json();

                    const userData = data.user || data;
                    const roleName = userData?.role?.name || userData?.roleName || 'Client';

                    setAdmin({
                        firstName: userData.first_name || userData.firstName || '',
                        lastName: userData.last_name || userData.lastName || '',
                        roleName: roleName
                    });
                }
            } catch (error) {
                console.error("Ошибка при загрузке профиля", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminProfile();
    }, []);

    const filteredPages = ADMIN_PAGES.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (page.requiresAdmin && admin?.roleName?.toLowerCase() !== 'admin') {
            return false;
        }

        return matchesSearch;
    });

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsDropdownOpen(false);
            router.push(`/admin/dashboard/users?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const getRoleDisplay = (role?: string) => {
        if (!role) return 'Загрузка...';
        const r = role.toLowerCase();
        if (r === 'admin' || r === 'администратор') return 'Главный администратор';
        if (r === 'moderator' || r === 'модератор') return 'Модератор';
        return 'Сотрудник платформы';
    };

    return (
        <header className="h-20 bg-white flex justify-between items-center w-full px-4 md:px-8 border-b border-slate-200 sticky top-0 z-30 shadow-sm gap-4">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden text-slate-500 hover:text-slate-900 p-1 flex-shrink-0 transition-colors"
                >
                    <span className="material-symbols-outlined text-3xl">menu</span>
                </button>

                <div className="flex-1 max-w-xl hidden sm:block relative" ref={searchRef}>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-700">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onKeyDown={handleSearch}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all duration-300"
                            placeholder="Поиск по разделам, курсам или пользователям..."
                        />
                    </div>

                    {isDropdownOpen && searchQuery.trim().length > 0 && (
                        <div className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col">

                            {filteredPages.length > 0 && (
                                <div className="p-2">
                                    <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Разделы и действия</p>
                                    {filteredPages.map((page, idx) => (
                                        <Link
                                            key={idx}
                                            href={page.path}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">{page.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{page.title}</p>
                                                <p className="text-[11px] text-slate-400">{page.type}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className={`p-2 ${filteredPages.length > 0 ? 'border-t border-slate-100 bg-slate-50/50' : ''}`}>
                                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Глобальный поиск в базе</p>
                                <Link
                                    href={`/admin/dashboard/users?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-white rounded-lg transition-colors group border border-transparent hover:border-slate-200"
                                >
                                    <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">person_search</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700">Искать пользователей: <span className="font-bold">"{searchQuery}"</span></p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </Link>

                                <Link
                                    href={`/admin/dashboard/courses?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-white rounded-lg transition-colors group border border-transparent hover:border-slate-200 mt-1"
                                >
                                    <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">library_books</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700">Искать в курсах: <span className="font-bold">"{searchQuery}"</span></p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </Link>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                <div className="hidden lg:flex flex-col items-end">
                    {isLoading ? (
                        <>
                            <div className="w-24 h-4 bg-slate-200 rounded animate-pulse mb-1"></div>
                            <div className="w-32 h-3 bg-slate-100 rounded animate-pulse"></div>
                        </>
                    ) : (
                        <>
                            <span className="text-sm font-bold text-slate-900">
                                {admin ? `${admin.lastName} ${admin.firstName?.charAt(0) || ''}.` : 'Неизвестный'}
                            </span>
                            <span className="text-xs text-blue-700 font-semibold">
                                {getRoleDisplay(admin?.roleName)}
                            </span>
                        </>
                    )}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md border-2 border-white ring-2 ring-slate-100">
                    {isLoading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    ) : (
                        <span className="font-bold text-sm">
                            {admin ? `${admin.lastName?.charAt(0) || ''}${admin.firstName?.charAt(0) || ''}` : 'A'}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}