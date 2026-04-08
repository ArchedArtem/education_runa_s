"use client";

import Link from "next/link";
import styles from './page.module.scss';

export default function Dashboard() {
    return (
        <div className={styles.pageWrapper}>
            <section className={styles.welcomeSection}>
                <h1 className={styles.mainTitle}>С возвращением, Иван!</h1>
                <p className={styles.mainSubtitle}>Ваш прогресс обучения и результаты на сегодня.</p>
            </section>

            <section className={styles.mainProgressGrid}>
                <div className={styles.featuredCard}>
                    <div className={styles.floatingIcon}>
                        <span className="material-symbols-outlined">account_balance</span>
                    </div>

                    <div className={styles.featuredContent}>
                        <div className={styles.featuredHeader}>
                            <span className={styles.tagYellow}>1С:Бухгалтерия</span>
                            <h3 className={styles.cardTitleLarge}>1С:Бухгалтерия предприятия 8.3</h3>
                            <p className={styles.cardDescription}>
                                Основы ведения учета, налогообложение и отчетность для малого бизнеса.
                            </p>
                        </div>

                        <div className={styles.progressBlock}>
                            <div className={styles.progressInfo}>
                                <span className={styles.progressLabel}>Прогресс обучения</span>
                                <span className={styles.progressValue}>65%</span>
                            </div>
                            <div className={styles.barContainer}>
                                <div className={styles.barFillLarge} style={{ width: '65%' }}></div>
                            </div>
                            <div className={styles.progressFooter}>
                                <span className={`material-symbols-outlined ${styles.iconSuccess}`}>check_circle</span>
                                <span>Пройдено 12 из 18 уроков</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featuredActions}>
                        <button className={styles.btnFeatured}>
                            <span>Продолжить</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>

                <div className={styles.compactProgressCard}>
                    <div className={styles.cardInternal}>
                        <div className={styles.iconBoxBlue}>
                            <span className="material-symbols-outlined">groups</span>
                        </div>
                        <div className={styles.compactText}>
                            <h3 className={styles.cardTitle}>1С:ЗУП 8 Корпоративная</h3>
                            <p className={styles.cardDescription}>Управление персоналом и расчет заработной платы.</p>
                        </div>
                        <div className={styles.compactProgress}>
                            <div className={styles.progressHeaderMini}>
                                <span>Прогресс</span>
                                <span>20%</span>
                            </div>
                            <div className={styles.barContainerMini}>
                                <div className={styles.barFillMini} style={{ width: '20%' }}></div>
                            </div>
                            <p className={styles.progressSubtext}>Пройдено 2 из 10 уроков</p>
                        </div>
                    </div>
                    <button className={styles.btnOutline}>
                        Продолжить курс
                    </button>
                </div>
            </section>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h3 className={styles.statTitle}>
                            <span className={`material-symbols-outlined ${styles.iconSuccess}`}>verified</span>
                            Завершенные курсы
                        </h3>
                        <span className={styles.statBadgeGreen}>Всего: 1</span>
                    </div>

                    <div className={styles.statBody}>
                        <div className={styles.listItem}>
                            <div className={styles.listItemMain}>
                                <div className={styles.listItemIcon}>
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                </div>
                                <div>
                                    <p className={styles.itemTitle}>1С:Управление торговлей</p>
                                    <p className={styles.itemSubtitle}>Завершено 14 мая 2026</p>
                                </div>
                            </div>
                            <div className={styles.listItemResult}>
                                <div className={styles.scoreCircle}>100</div>
                                <span className={`material-symbols-outlined ${styles.iconSuccess}`}>check</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statFooter}>
                        <Link href="/certificates" className={styles.footerLink}>
                            Посмотреть сертификаты
                            <span className="material-symbols-outlined">open_in_new</span>
                        </Link>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h3 className={styles.statTitle}>
                            <span className={`material-symbols-outlined ${styles.iconBlue}`}>history</span>
                            История тестирования
                        </h3>
                        <Link href="/dashboard/tests" className={styles.viewAllLink}>
                            СМОТРЕТЬ ВСЕ
                        </Link>
                    </div>

                    <div className={styles.statBody}>
                        <div className={styles.historyItem}>
                            <div className={styles.historyHeader}>
                                <span className={styles.historyTag}>Итоговый тест</span>
                                <span className={styles.historyGrade}>Отлично</span>
                            </div>
                            <p className={styles.itemTitle}>1С:Бухгалтерия (Модуль 1-4)</p>
                            <div className={styles.historyFooter}>
                                <div className={styles.historyMeta}>
                                    <span className={styles.certifiedTag}>Сертифицирован</span>
                                    <span className={styles.dateText}>12 Июня</span>
                                </div>
                                <div className={styles.scoreDisplay}>
                                    <span className={styles.scoreBig}>95</span>
                                    <span className={styles.scoreSmall}>/100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}