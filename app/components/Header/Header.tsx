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

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                setIsAuth(true);
            } else {
                setIsAuth(false);
            }
        };
        checkAuth();
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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Руна С Обучение
                </Link>

                <div className={styles.nav}>
                    <Link
                        href="/about"
                        className={pathname === '/about' ? styles.linkActive : styles.link}
                    >
                        О платформе
                    </Link>
                    <Link
                        href="/catalog"
                        className={pathname === '/catalog' ? styles.linkActive : styles.link}
                    >
                        Программа
                    </Link>
                    <Link
                        href="/contacts"
                        className={pathname === '/contacts' ? styles.linkActive : styles.link}
                    >
                        Контакты
                    </Link>
                    {isAuth && (
                        <Link
                            href="/dashboard"
                            className={pathname === '/dashboard' ? styles.linkActive : styles.link}
                        >
                            Мое обучение
                        </Link>
                    )}
                </div>

                <div className={styles.desktopActions}>
                    {!isAuth ? (
                        <>
                            <Link href="/login" className={styles.loginBtn}>Вход</Link>
                            <Link href="/register" className={styles.registerBtn}>Регистрация</Link>
                        </>
                    ) : (
                        <button onClick={handleLogout} className={styles.registerBtn}>
                            Выйти
                        </button>
                    )}
                </div>

                <button
                    className={styles.menuButton}
                    onClick={toggleMobileMenu}
                    aria-label="Меню"
                >
                    <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`} />
                </button>
            </div>

            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.mobileNav}>
                    <Link
                        href="/about"
                        className={pathname === '/about' ? styles.mobileLinkActive : styles.mobileLink}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        О платформе
                    </Link>
                    <Link
                        href="/catalog"
                        className={pathname === '/catalog' ? styles.mobileLinkActive : styles.mobileLink}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Программа
                    </Link>
                    <Link
                        href="/contacts"
                        className={pathname === '/contacts' ? styles.mobileLinkActive : styles.mobileLink}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Контакты
                    </Link>
                    {isAuth && (
                        <Link
                            href="/dashboard"
                            className={pathname === '/dashboard' ? styles.mobileLinkActive : styles.mobileLink}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Мое обучение
                        </Link>
                    )}
                </div>
                <div className={styles.mobileActions}>
                    {!isAuth ? (
                        <>
                            <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setIsMobileMenuOpen(false)}>
                                Вход
                            </Link>
                            <Link href="/register" className={styles.mobileRegisterBtn} onClick={() => setIsMobileMenuOpen(false)}>
                                Регистрация
                            </Link>
                        </>
                    ) : (
                        <button onClick={handleLogout} className={styles.mobileRegisterBtn}>
                            Выйти
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}