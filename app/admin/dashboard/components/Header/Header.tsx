"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
    setIsOpen: (isOpen: boolean) => void;
}

type AdminProfile = {
    firstName: string;
    lastName: string;
    roleName: string;
};

export default function AdminHeader({ setIsOpen }: AdminHeaderProps) {
    const [admin, setAdmin] = useState<AdminProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch('/api/admin/auth/me', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setAdmin(data);
                }
            } catch (error) {
                console.error("Ошибка при загрузке профиля", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminProfile();
    }, []);

    // Поиск по нажатию Enter
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            // Перенаправляем в раздел пользователей с параметром поиска
            router.push(`/admin/dashboard/users?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Перевод системной роли
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

                <div className="flex-1 max-w-xl hidden sm:block">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-700">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all duration-300"
                            placeholder="Поиск по ID клиента, email или названию (Нажмите Enter)..."
                        />
                    </div>
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
                                {admin ? `${admin.lastName} ${admin.firstName.charAt(0)}.` : 'Неизвестный'}
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
                            {admin ? `${admin.lastName.charAt(0)}${admin.firstName.charAt(0)}` : 'A'}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}