"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Header.module.scss';

export default function Header() {
    const router = useRouter();
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
                    <Link href="/about" className={styles.linkActive}>О платформе</Link>
                    <Link href="/catalog" className={styles.link}>Программа</Link>
                    <Link href="/contacts" className={styles.link}>Контакты</Link>
                    {isAuth && <Link href="/dashboard" className={styles.link}>Мое обучение</Link>}
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