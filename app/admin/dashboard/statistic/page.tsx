"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.scss';

type StatData = {
    overview: { activeUsers: number; passRate: number; avgScore: number; totalViews: number; };
    courseStats: Array<{ id: number; title: string; uniqueViews: number; completionRate: number; }>;
    topStudents: Array<{ name: string; company: string; avgScore: number; testsTaken: number; }>;
    problematicTests: Array<{ title: string; avgScore: number; courseId: number | null; lessonId: number | null; }>;
    activityFeed: Array<{ id: string; type: string; userName: string; targetName: string; date: string | null; success: boolean; score?: number; }>;
};

export default function StatisticPage() {
    const [data, setData] = useState<StatData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch(`/api/admin/statistic?period=${filter}`, { headers });
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
    }, [filter]);

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.headerSection}>
                <div>
                    <h1>Детальная статистика</h1>
                    <p>Анализ метрик, рейтинги клиентов и вовлеченность.</p>
                </div>
                <div className={styles.filterGroup}>
                    <button className={filter === '7d' ? styles.active : ''} onClick={() => setFilter('7d')}>За 7 дней</button>
                    <button className={filter === '30d' ? styles.active : ''} onClick={() => setFilter('30d')}>За 30 дней</button>
                    <button className={filter === 'all' ? styles.active : ''} onClick={() => setFilter('all')}>За все время</button>
                </div>
            </section>

            {loading ? (
                <div className={styles.loaderContainer}>
                    <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                    <p>Анализируем данные...</p>
                </div>
            ) : (
                <>
                    <section className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Уникальных клиентов</span>
                            <span className={styles.statValue}>{data?.overview.activeUsers || 0}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Всего уникальных открытий</span>
                            <span className={styles.statValue}>{data?.overview.totalViews || 0}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Успешность тестов</span>
                            <span className={styles.statValue}>{data?.overview.passRate || 0}%</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Средний балл по платформе</span>
                            <span className={styles.statValue}>{data?.overview.avgScore || 0}</span>
                        </div>
                    </section>

                    <section className={styles.bentoGridTop}>
                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <h2>Топ клиентов</h2>
                                <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                            </div>
                            <div className={styles.leaderboard}>
                                {data?.topStudents && data.topStudents.length > 0 ? data.topStudents.map((st, i) => (
                                    <div key={i} className={styles.leaderboardItem}>
                                        <div className={styles.rank}>{i + 1}</div>
                                        <div className={styles.studentInfo}>
                                            <h3>{st.name}</h3>
                                            <p>{st.company}</p>
                                        </div>
                                        <div className={styles.studentScore}>
                                            <span className={styles.score}>{st.avgScore}</span>
                                            <span className={styles.tests}>тестов: {st.testsTaken}</span>
                                        </div>
                                    </div>
                                )) : <p className={styles.emptyState}>Нет данных для рейтинга</p>}
                            </div>
                        </div>

                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <h2>Зоны риска (Сложные тесты)</h2>
                                <span className="material-symbols-outlined text-red-500">warning</span>
                            </div>
                            <div className={styles.riskList}>
                                {data?.problematicTests && data.problematicTests.length > 0 ? data.problematicTests.map((t, i) => (
                                    t.courseId && t.lessonId ? (
                                        <Link
                                            key={i}
                                            href={`/admin/dashboard/courses/${t.courseId}/lessons/${t.lessonId}/edit?tab=test`}
                                            className={styles.riskItem}
                                            style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex' }}
                                        >
                                            <div className={styles.riskIcon}><span className="material-symbols-outlined">quiz</span></div>
                                            <div className={styles.riskInfo}>
                                                <h3>{t.title}</h3>
                                                <p>Средний балл: <strong>{t.avgScore}</strong></p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div key={i} className={styles.riskItem}>
                                            <div className={styles.riskIcon}><span className="material-symbols-outlined">quiz</span></div>
                                            <div className={styles.riskInfo}>
                                                <h3>{t.title}</h3>
                                                <p>Средний балл: <strong>{t.avgScore}</strong></p>
                                            </div>
                                        </div>
                                    )
                                )) : <p className={styles.emptyState}>Проблемных тестов не найдено</p>}
                            </div>
                        </div>
                    </section>

                    <section className={styles.bentoGridBottom}>
                        <div className={styles.panel}>
                            <h2>Популярность курсов</h2>
                            {data?.courseStats && data.courseStats.length > 0 ? (
                                <div className={styles.courseList}>
                                    {data.courseStats.map((course) => (
                                        <div key={course.id} className={styles.courseItem}>
                                            <div className={styles.courseInfo}>
                                                <h3>{course.title}</h3>
                                                <span>{course.completionRate}%</span>
                                            </div>
                                            <div className={styles.progressTrack}>
                                                <div className={styles.progressFill} style={{ width: `${course.completionRate}%` }}></div>
                                            </div>
                                            <div className={styles.meta}>
                                                <span>Завершаемость</span>
                                                <span>Уникальных учеников: {course.uniqueViews}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className={styles.emptyState}>Нет данных по курсам.</p>}
                        </div>

                        <div className={styles.panel}>
                            <h2>Хронология событий</h2>
                            {data?.activityFeed && data.activityFeed.length > 0 ? (
                                <div className={styles.timeline}>
                                    {data.activityFeed.map((item) => {
                                        const isLesson = item.type === 'lesson';
                                        return (
                                            <div key={item.id} className={styles.timelineItem}>
                                                <div className={`${styles.timelineIcon} ${isLesson ? styles.lesson : (item.success ? styles.testPassed : styles.testFailed)}`}>
                                                    <span className="material-symbols-outlined">{isLesson ? 'menu_book' : (item.success ? 'verified' : 'cancel')}</span>
                                                </div>
                                                <div className={styles.timelineContent}>
                                                    <p>
                                                        <strong>{item.userName}</strong> {isLesson ? 'завершил(а) урок' : (item.success ? `сдал(а) тест на ${item.score} б.` : `провалил(а) тест (${item.score}б.)`)} <strong>«{item.targetName}»</strong>
                                                    </p>
                                                    <span className={styles.date}>
                                                        {item.date ? new Date(item.date).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Старая запись'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className={styles.emptyState}>Активность пока отсутствует.</p>}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}