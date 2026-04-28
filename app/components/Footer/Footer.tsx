"use client";

import Link from 'next/link';
import useSWR from 'swr';
import styles from './footer.module.scss';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Footer() {
    const { data: settings } = useSWR('/api/settings', fetcher);

    const platformName = settings?.platformName || 'Руна С Обучение';
    const supportEmail = settings?.supportEmail || 'runa_post@mail.ru';
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.leftSide}>
                    <div className={styles.logo}>{platformName}</div>
                    <p className={styles.copyright}>© {currentYear} {platformName}. Все права защищены.</p>
                </div>

                <div className={styles.rightSide}>
                    <Link href="/contacts" className={styles.supportLink}>
                        Поддержка клиентов
                    </Link>

                    <div className={styles.socials}>
                        <a href={`mailto:${supportEmail}`} className={styles.iconBtn}>
                            <span className="material-symbols-outlined">mail</span>
                        </a>
                        <Link href="/about" className={styles.iconBtn}>
                            <span className="material-symbols-outlined">info</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}