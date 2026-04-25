"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import styles from './page.module.scss';

type DashboardStats = {
    user: { first_name: string; company_name: string };
    stats: { coursesStarted: number; lessonsCompleted: number; avgTestScore: number };
    lastCourse: {
        courseId: number;
        lastLessonId: number;
        courseTitle: string;
        courseDescription: string;
        completedLessons: number;
        totalLessons: number;
        percentage: number;
    } | null;
    recentTests: Array<{ id: number; testTitle: string; score: number; is_passed: boolean; date: string }>;
};

export default function Dashboard() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch('/api/user/dashboard-stats', { headers });
                if (!res.ok) throw new Error('Ошибка загрузки данных');
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Твой новый лоадер
    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loaderContainer}>
                    <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                    <p>Загружаем статистику...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.welcomeSection}>
                <h1 className={styles.mainTitle}>С возвращением, {data?.user.first_name || 'Студент'}!</h1>
                <p className={styles.mainSubtitle}>Ваш прогресс обучения и результаты на сегодня.</p>
            </section>

            <section className={styles.mainProgressGrid}>
                {/* Карточка текущего курса */}
                <div className={styles.featuredCard}>
                    <div className={styles.floatingIcon}>
                        <span className="material-symbols-outlined">account_balance</span>
                    </div>

                    <div className={styles.featuredContent}>
                        <div className={styles.featuredHeader}>
                            <span className={styles.tagYellow}>Текущий курс</span>
                            <h3 className={styles.cardTitleLarge}>
                                {data?.lastCourse?.courseTitle || 'Выберите курс'}
                            </h3>
                            <p className={styles.cardDescription}>
                                {data?.lastCourse?.courseDescription || 'Вы еще не начали обучение. Перейдите в каталог курсов.'}
                            </p>
                        </div>

                        <div className={styles.progressBlock}>
                            <div className={styles.progressInfo}>
                                <span className={styles.progressLabel}>Прогресс курса</span>
                                <span className={styles.progressValue}>
                                    {data?.lastCourse ? `${data.lastCourse.percentage}%` : '0%'}
                                </span>
                            </div>
                            <div className={styles.barContainer}>
                                {/* Динамическая ширина полоски */}
                                <div
                                    className={styles.barFillLarge}
                                    style={{ width: `${data?.lastCourse?.percentage || 0}%` }}
                                ></div>
                            </div>
                            <div className={styles.progressFooter}>
                                <span className={`material-symbols-outlined ${styles.iconSuccess}`}>check_circle</span>
                                <span>
                                    {data?.lastCourse
                                        ? `Пройдено ${data.lastCourse.completedLessons} из ${data.lastCourse.totalLessons} уроков`
                                        : 'Нет начатых уроков'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featuredActions}>
                        {data?.lastCourse ? (
                            <Link href={`/dashboard/courses/${data.lastCourse.courseId}/lessons/${data.lastCourse.lastLessonId}`}>
                                <button className={styles.btnFeatured}>
                                    <span>Продолжить</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </Link>
                        ) : (
                            <Link href={`/dashboard/courses`}>
                                <button className={styles.btnFeatured}>
                                    <span>Каталог курсов</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className={styles.compactProgressCard}>
                    <div className={styles.cardInternal}>
                        <div className={styles.iconBoxBlue}>
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <div className={styles.compactText}>
                            <h3 className={styles.cardTitle}>Общая статистика</h3>
                            <p className={styles.cardDescription}>Показатели по всем курсам.</p>
                        </div>
                        <div className={styles.compactProgress}>
                            <div className={styles.progressHeaderMini}>
                                <span>Средний балл тестов</span>
                                <span>{data?.stats.avgTestScore || 0}%</span>
                            </div>
                            <div className={styles.barContainerMini}>
                                <div className={styles.barFillMini} style={{ width: `${data?.stats.avgTestScore || 0}%` }}></div>
                            </div>
                            <p className={styles.progressSubtext}>Начато курсов: {data?.stats.coursesStarted || 0}</p>
                        </div>
                    </div>
                    <Link href="/dashboard/courses" style={{ textDecoration: 'none' }}>
                        <button className={styles.btnOutline}>
                            Перейти в каталог
                        </button>
                    </Link>
                </div>
            </section>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <h3 className={styles.statTitle}>
                            <span className={`material-symbols-outlined ${styles.iconSuccess}`}>verified</span>
                            Учебная активность
                        </h3>
                        <span className={styles.statBadgeGreen}>Активно</span>
                    </div>

                    <div className={styles.statBody}>
                        <div className={styles.listItem}>
                            <div className={styles.listItemMain}>
                                <div className={styles.listItemIcon}>
                                    <span className="material-symbols-outlined">menu_book</span>
                                </div>
                                <div>
                                    <p className={styles.itemTitle}>Пройдено уроков (всего)</p>
                                    <p className={styles.itemSubtitle}>Суммарно по всем курсам</p>
                                </div>
                            </div>
                            <div className={styles.listItemResult}>
                                <div className={styles.scoreCircle}>{data?.stats.lessonsCompleted || 0}</div>
                                <span className={`material-symbols-outlined ${styles.iconSuccess}`}>check</span>
                            </div>
                        </div>
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
                        {data?.recentTests && data.recentTests.length > 0 ? (
                            data.recentTests.slice(0, 2).map((test) => (
                                <div key={test.id} className={styles.historyItem} style={{ marginBottom: '1rem' }}>
                                    <div className={styles.historyHeader}>
                                        <span className={styles.historyTag}>Тест к уроку</span>
                                        <span className={styles.historyGrade} style={{ color: test.is_passed ? '#1d4ed8' : '#ef4444' }}>
                                            {test.is_passed ? 'Сдан' : 'Не сдан'}
                                        </span>
                                    </div>
                                    <p className={styles.itemTitle}>{test.testTitle}</p>
                                    <div className={styles.historyFooter}>
                                        <div className={styles.historyMeta}>
                                            <span
                                                className={styles.certifiedTag}
                                                style={{
                                                    color: test.is_passed ? '#1d4ed8' : '#ef4444',
                                                    backgroundColor: test.is_passed ? '#eff6ff' : '#fee2e2'
                                                }}
                                            >
                                                {test.is_passed ? 'Успешно' : 'Провал'}
                                            </span>
                                            <span className={styles.dateText}>
                                                {new Date(test.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <div className={styles.scoreDisplay}>
                                            <span className={styles.scoreBig}>{test.score}</span>
                                            <span className={styles.scoreSmall}>/100</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.itemSubtitle}>Вы еще не проходили тестирования.</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}