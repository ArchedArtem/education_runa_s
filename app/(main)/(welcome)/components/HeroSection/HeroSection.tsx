import styles from './HeroSection.module.scss';
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className={styles.section}>
            <div className={styles.textContent}>
                <div className="space-y-4">
                    <h1 className={styles.title}>
                        Обучение <span>1С</span>
                    </h1>
                    <p className={styles.description}>
                        Закрытая образовательная платформа для клиентов компании. Профессиональный рост и экспертные знания.
                    </p>
                </div>
                <Link href={'/dashboard'} className={styles.startBtn}>
                    Начать обучение
                </Link>
            </div>

            <div className={styles.visualSide}>
                <div className={styles.sphere}></div>

                <Link href="/dashboard" className={`${styles.infoCard} ${styles.cardProgress}`}>
                    <div className={styles.cardIcon}>
                        <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <div className={styles.cardData}>
                        <span className={styles.cardLabel}>Ваш прогресс</span>
                        <div className={styles.barContainer}>
                            <div className={styles.barFill} style={{ width: '70%' }}></div>
                        </div>
                    </div>
                    <div className={styles.cardValue}>70%</div>
                </Link>

                <Link href="/dashboard" className={`${styles.infoCard} ${styles.cardCert}`}>
                    <div className={`${styles.cardIcon} ${styles.certIcon}`}>
                        <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div className={styles.cardData}>
                        <span className={styles.cardLabel}>Достижения</span>
                        <span className={styles.cardStatus}>Получено 3 сертификата</span>
                    </div>
                    <div className={styles.certBadge}>
                        <span className="material-symbols-outlined">verified</span>
                    </div>
                </Link>

                <Link href="/dashboard/courses" className={`${styles.infoCard} ${styles.cardCourses}`}>
                    <div className={styles.cardIcon}>
                        <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div className={styles.cardData}>
                        <span className={styles.cardLabel}>Доступно курсов</span>
                        <span className={styles.cardCount}>12 экспертных модулей</span>
                    </div>
                    <span className="material-symbols-outlined">chevron_right</span>
                </Link>
            </div>

            <div className={styles.scrollHint}>
                <span className="material-symbols-outlined">expand_more</span>
            </div>
        </section>
    );
}