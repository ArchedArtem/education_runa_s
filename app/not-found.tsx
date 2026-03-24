import Link from 'next/link';
import styles from './not-found.module.scss';
import "./globals.css";

export default function NotFound() {
    return (
        <main className={`${styles.main} ${styles.bgMesh}`}>
            {/* Декоративные сферы на фоне (как на страницах авторизации) */}
            <div className="absolute top-[10%] left-[-5%] w-64 h-64 rounded-full border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(2px)' }}></div>
            <div className="absolute bottom-[10%] right-[-5%] w-96 h-96 rounded-full border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(2px)' }}></div>

            <div className={styles.glassCard}>
                <div className={styles.errorCode}>404</div>
                <h1 className={styles.title}>Страница не найдена</h1>
                <p className={styles.description}>
                    Кажется, вы перешли по неверной ссылке или страница была удалена. Давайте вернемся к обучающим материалам по 1С.
                </p>

                <Link href="/" className={styles.homeBtn}>
                    На главную страницу
                </Link>
            </div>
        </main>
    );
}