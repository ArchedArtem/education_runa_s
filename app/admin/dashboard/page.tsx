"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.scss';

type DashboardData = {
    stats: {
        totalUsers: number;
        activeCourses: number;
        avgTestScore: number;
        completionRate: number;
    };
    recentUsers: Array<{
        id: string;
        name: string;
        company: string;
        email: string;
        date: string;
        status: string;
    }>;
    chart: {
        data: Array<{ date: string; count: number }>;
        max: number;
    };
};

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch('/api/admin/dashboard-stats', { headers });
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
                    <p>Загружаем данные платформы...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.headerSection}>
                <h1>Сводная статистика</h1>
                <p>Показатели платформы и активность клиентов.</p>
            </section>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <div className={`${styles.iconBox} ${styles.blue}`}>
                            <span className="material-symbols-outlined">group</span>
                        </div>
                    </div>
                    <div>
                        <p className={styles.statLabel}>Всего клиентов</p>
                        <h3 className={styles.statValue}>{data?.stats.totalUsers || 0}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <div className={`${styles.iconBox} ${styles.indigo}`}>
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                    </div>
                    <div>
                        <p className={styles.statLabel}>Активные курсы</p>
                        <h3 className={styles.statValue}>{data?.stats.activeCourses || 0}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <div className={`${styles.iconBox} ${styles.amber}`}>
                            <span className="material-symbols-outlined">workspace_premium</span>
                        </div>
                    </div>
                    <div>
                        <p className={styles.statLabel}>Средний балл тестов</p>
                        <h3 className={styles.statValue}>
                            {data?.stats.avgTestScore || 0}<small>/100</small>
                        </h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <div className={`${styles.iconBox} ${styles.emerald}`}>
                            <span className="material-symbols-outlined">task_alt</span>
                        </div>
                    </div>
                    <div>
                        <p className={styles.statLabel}>Завершаемость курсов</p>
                        <h3 className={styles.statValue}>{data?.stats.completionRate || 0}%</h3>
                    </div>
                </div>
            </section>

            <section className={styles.bottomGrid}>
                <div className={styles.sectionPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>Активность обучения</h2>
                            <p>Пройденные уроки за последние 7 дней</p>
                        </div>
                        <Link href="/admin/dashboard/statistic" className={styles.actionLink}>
                            Подробный отчет
                        </Link>
                    </div>

                    <div className={styles.chartPattern}>
                        {data?.chart.data.map((day, index) => {
                            const heightPercent = data.chart.max > 0
                                ? Math.max((day.count / data.chart.max) * 100, 5)
                                : 5;

                            const isMax = day.count > 0 && day.count === data.chart.max;

                            return (
                                <div
                                    key={index}
                                    className={`${styles.chartBar} ${isMax ? styles.maxBar : ''}`}
                                    style={{ height: `${heightPercent}%` }}
                                >
                                    <span className={styles.barTooltip}>{day.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.sectionPanel}>
                    <div className={styles.panelHeader}>
                        <h2>Новые клиенты</h2>
                        <Link href="/admin/dashboard/users">
                            <span className="material-symbols-outlined" style={{ color: '#94a3b8', cursor: 'pointer' }}>more_horiz</span>
                        </Link>
                    </div>

                    <div className={styles.clientList}>
                        {data?.recentUsers.map(client => (
                            <div key={client.id} className={styles.clientItem}>
                                <div className={styles.avatar}>
                                    {client.name.charAt(0)}
                                </div>
                                <div className={styles.info}>
                                    <h3>{client.name}</h3>
                                    <p>{client.email}</p>
                                </div>
                                <div className={styles.meta}>
                                    <p>{client.date}</p>
                                    <span className={`${styles.statusBadge} ${client.status === 'Активен' ? styles.active : styles.blocked}`}>
                                        {client.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/admin/dashboard/users" className={styles.btnFull}>
                        Смотреть всех пользователей
                    </Link>
                </div>
            </section>
        </div>
    );
}