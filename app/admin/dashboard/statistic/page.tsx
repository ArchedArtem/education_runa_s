"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.scss';

type StatData = {
    overview: {
        totalUsers: number;
        passRate: number;
        avgScore: number;
        totalViews: number;
    };
    courseStats: Array<{
        id: number;
        title: string;
        views: number;
        completionRate: number;
    }>;
    activityFeed: Array<{
        id: string;
        type: 'lesson' | 'test';
        userName: string;
        targetName: string;
        date: string;
        success: boolean;
        score?: number;
    }>;
};

export default function StatisticPage() {
    const [data, setData] = useState<StatData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch('/api/admin/statistic', { headers });
                if (!res.ok) throw new Error('Ошибка загрузки статистики');
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loaderContainer}>
                    <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                    <p>Анализируем данные платформы...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.headerSection}>
                <div>
                    <h1>Подробная статистика</h1>
                    <p>Анализ курсов, успеваемости и активности пользователей.</p>
                </div>
                <div className={styles.filterGroup}>
                    <button className={filter === '7d' ? styles.active : ''} onClick={() => setFilter('7d')}>7 дней</button>
                    <button className={filter === '30d' ? styles.active : ''} onClick={() => setFilter('30d')}>30 дней</button>
                    <button className={filter === 'all' ? styles.active : ''} onClick={() => setFilter('all')}>За все время</button>
                </div>
            </section>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Уникальных просмотров</span>
                    <span className={styles.statValue}>{data?.overview.totalViews || 0}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Активных пользователей</span>
                    <span className={styles.statValue}>{data?.overview.totalUsers || 0}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Процент успешных сдач</span>
                    <span className={styles.statValue}>{data?.overview.passRate || 0}%</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Средний балл по системе</span>
                    <span className={styles.statValue}>{data?.overview.avgScore || 0}</span>
                </div>
            </section>

            <section className={styles.bentoGrid}>
                <div className={styles.panel}>
                    <h2>Популярность и завершаемость курсов</h2>
                    {data?.courseStats && data.courseStats.length > 0 ? (
                        <div className={styles.courseList}>
                            {data.courseStats.map((course) => (
                                <div key={course.id} className={styles.courseItem}>
                                    <div className={styles.courseInfo}>
                                        <h3>{course.title}</h3>
                                        <span>{course.completionRate}%</span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div
                                            className={styles.progressFill}
                                            style={{ width: `${course.completionRate}%` }}
                                        ></div>
                                    </div>
                                    <div className={styles.meta}>
                                        <span>Завершаемость</span>
                                        <span>Всего прохождений уроков: {course.views}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.emptyState}>Нет данных по курсам.</p>
                    )}
                </div>

                <div className={styles.panel}>
                    <h2>Лента активности</h2>
                    {data?.activityFeed && data.activityFeed.length > 0 ? (
                        <div className={styles.timeline}>
                            {data.activityFeed.map((item) => {
                                let icon = '';
                                let iconClass = '';
                                let actionText = '';

                                if (item.type === 'lesson') {
                                    icon = 'menu_book';
                                    iconClass = styles.lesson;
                                    actionText = 'завершил(а) урок';
                                } else if (item.type === 'test' && item.success) {
                                    icon = 'verified';
                                    iconClass = styles.testPassed;
                                    actionText = `сдал(а) тест на ${item.score} баллов`;
                                } else {
                                    icon = 'cancel';
                                    iconClass = styles.testFailed;
                                    actionText = `провалил(а) тест (${item.score} баллов)`;
                                }

                                return (
                                    <div key={item.id} className={styles.timelineItem}>
                                        <div className={`${styles.timelineIcon} ${iconClass}`}>
                                            <span className="material-symbols-outlined">{icon}</span>
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <p>
                                                <strong>{item.userName}</strong> {actionText} <strong>«{item.targetName}»</strong>
                                            </p>
                                            <span className={styles.date}>
                                                {new Date(item.date).toLocaleString('ru-RU', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={styles.emptyState}>Активность пока отсутствует.</p>
                    )}
                </div>
            </section>
        </div>
    );
}