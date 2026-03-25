import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.leftSide}>
                    <div className={styles.logo}>Руна С Обучение</div>
                    <p className={styles.copyright}>© 2026 Руна С Обучение. Все права защищены.</p>
                </div>

                <div className={styles.rightSide}>
                    <Link href="/support" className={styles.supportLink}>
                        Поддержка клиентов
                    </Link>

                    <div className={styles.socials}>
                        <a href="mailto:support@runas.ru" className={styles.iconBtn}>
                            <span className="material-symbols-outlined">mail</span>
                        </a>
                        <Link href="/info" className={styles.iconBtn}>
                            <span className="material-symbols-outlined">info</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}