import Link from 'next/link';
import styles from './CtaSection.module.scss';

export default function CtaSection() {
    return (
        <section className={styles.section}>
            <div className={styles.card}>
                <div className={styles.glowTop}></div>
                <div className={styles.glowBottom}></div>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        Готовы повысить свою квалификацию?
                    </h2>

                    <p className={styles.description}>
                        Получите доступ к уникальной базе знаний и станьте востребованным специалистом в экосистеме 1С уже сегодня.
                    </p>

                    <div className={styles.actionWrapper}>
                        <Link href="/register" className={styles.actionBtn}>
                            Регистрация на платформе
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}