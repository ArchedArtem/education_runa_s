"use client";

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Header.module.scss';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuth, setIsAuth] = useState(false);

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

                <div className={styles.actions}>
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
            </div>
        </nav>
    );
}