"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './header.module.scss';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuth, setIsAuth] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [platformName, setPlatformName] = useState('Руна С Обучение');
    const [allowRegistration, setAllowRegistration] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                setIsAuth(true);
            } else {
                setIsAuth(false);
            }
        };

        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.platformName) {
                        setPlatformName(data.platformName);
                    }
                    if (data?.allowRegistration !== undefined) {
                        setAllowRegistration(data.allowRegistration);
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки настроек', error);
            }
        };

        checkAuth();
        fetchSettings();
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            setIsAuth(false);
            router.push('/');
            router.refresh();
        }
    };

    return (
        <nav className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    {platformName}
                </Link>

                <div className={styles.nav}>
                    <Link href="/about" className={pathname === '/about' ? styles.linkActive : styles.link}>
                        О платформе
                    </Link>
                    <Link href="/catalog" className={pathname === '/catalog' ? styles.linkActive : styles.link}>
                        Программа
                    </Link>
                    <Link href="/contacts" className={pathname === '/contacts' ? styles.linkActive : styles.link}>
                        Контакты
                    </Link>
                    {isAuth && (
                        <Link href="/dashboard" className={pathname === '/dashboard' ? styles.linkActive : styles.link}>
                            Мое обучение
                        </Link>
                    )}
                </div>

                <div className={styles.desktopActions}>
                    {!isAuth ? (
                        <>
                            <Link href="/login" className={styles.loginBtn}>Вход</Link>
                            {allowRegistration && (
                                <Link href="/register" className={styles.registerBtn}>Регистрация</Link>
                            )}
                        </>
                    ) : (
                        <button onClick={handleLogout} className={styles.registerBtn}>
                            Выйти
                        </button>
                    )}
                </div>

                <button
                    className="md:hidden text-slate-900 hover:text-blue-700 transition-colors p-2"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Открыть меню"
                >
                    <span className="material-symbols-outlined text-3xl">menu</span>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div
                className={`fixed inset-y-0 right-0 w-72 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
                    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-lg">Меню</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2">
                    <Link
                        href="/about"
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${pathname === '/about' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        О платформе
                    </Link>
                    <Link
                        href="/catalog"
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${pathname === '/catalog' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Программа
                    </Link>
                    <Link
                        href="/contacts"
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${pathname === '/contacts' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Контакты
                    </Link>
                    {isAuth && (
                        <Link
                            href="/dashboard"
                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Мое обучение
                        </Link>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 space-y-3 bg-slate-50">
                    {!isAuth ? (
                        <>
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-colors text-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Вход
                            </Link>
                            {allowRegistration && (
                                <Link
                                    href="/register"
                                    className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-700 text-white font-bold rounded-lg shadow-sm hover:bg-blue-800 transition-colors text-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Регистрация
                                </Link>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center py-2.5 px-4 bg-white border border-slate-200 text-red-600 font-bold rounded-lg shadow-sm hover:bg-red-50 transition-colors text-sm"
                        >
                            Выйти из аккаунта
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}