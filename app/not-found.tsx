"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './not-found.module.scss';

export default function NotFound() {
    const pathname = usePathname();

    let backLink = "/";
    let btnText = "На главную страницу";

    if (pathname.startsWith('/admin/dashboard')) {
        backLink = "/admin/dashboard";
        btnText = "В панель администратора";
    } else if (pathname.startsWith('/dashboard')) {
        backLink = "/dashboard";
        btnText = "В личный кабинет";
    }

    return (
        <main className={`${styles.main} ${styles.bgMesh}`}>
            <div className="absolute top-[10%] left-[-5%] w-64 h-64 rounded-full border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(2px)' }}></div>
            <div className="absolute bottom-[10%] right-[-5%] w-96 h-96 rounded-full border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(2px)' }}></div>

            <div className={styles.glassCard}>
                <div className={styles.errorCode}>404</div>
                <h1 className={styles.title}>Страница не найдена</h1>
                <p className={styles.description}>
                    Кажется, вы перешли по неверной ссылке или страница была удалена.
                </p>

                <Link href={backLink} className={styles.homeBtn}>
                    {btnText}
                </Link>
            </div>
        </main>
    );
}