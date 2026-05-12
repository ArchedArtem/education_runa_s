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
    aiStats?: { totalGenerated: number; totalTokens: number; promptTokens: number; completionTokens: number; };
};

export default function StatisticPage() {
    const [data, setData] = useState<StatData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [userRole, setUserRole] = useState<string | null>(null);

    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printSections, setPrintSections] = useState({
        overview: true,
        topStudents: true,
        riskZones: true,
        ai: true,
        courses: true,
        timeline: true
    });

    useEffect(() => {
        const fetchStatsAndRole = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const roleRes = await fetch('/api/admin/auth/me', { headers });
                if (roleRes.ok) {
                    const roleData = await roleRes.json();
                    setUserRole(roleData.roleName);
                }

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

        fetchStatsAndRole();
    }, [filter]);

    const handleConfirmPrint = () => {
        setIsPrintModalOpen(false);
        setTimeout(() => window.print(), 100);
    };

    return (
        <div className={styles.pageWrapper}>
            {isPrintModalOpen && (
                <div className={styles.printModalOverlay}>
                    <div className={styles.printModal}>
                        <div className={styles.printModalHeader}>
                            <h2>Настройка отчета</h2>
                            <button onClick={() => setIsPrintModalOpen(false)} className={styles.closeBtn}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <p className={styles.printModalDesc}>Выберите блоки данных для включения в печатный документ:</p>

                        <div className={styles.printOptions}>
                            <button type="button" className={`${styles.optionBtn} ${printSections.overview ? styles.optionSelected : ''}`} onClick={() => setPrintSections(s => ({ ...s, overview: !s.overview }))}>
                                <div className={`${styles.checkControl} ${printSections.overview ? styles.checked : ''}`}>
                                    {printSections.overview && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>}
                                </div>
                                <span className={styles.optionLabel}>Общая сводка (карточки)</span>
                            </button>

                            {userRole === 'Admin' && (
                                <button type="button" className={`${styles.optionBtn} ${printSections.topStudents ? styles.optionSelected : ''}`} onClick={() => setPrintSections(s => ({ ...s, topStudents: !s.topStudents }))}>
                                    <div className={`${styles.checkControl} ${printSections.topStudents ? styles.checked : ''}`}>
                                        {printSections.topStudents && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>}
                                    </div>
                                    <span className={styles.optionLabel}>Рейтинг клиентов</span>
                                </button>
                            )}

                            <button type="button" className={`${styles.optionBtn} ${printSections.riskZones ? styles.optionSelected : ''}`} onClick={() => setPrintSections(s => ({ ...s, riskZones: !s.riskZones }))}>
                                <div className={`${styles.checkControl} ${printSections.riskZones ? styles.checked : ''}`}>
                                    {printSections.riskZones && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>}
                                </div>
                                <span className={styles.optionLabel}>Зоны риска (Сложные тесты)</span>
                            </button>

                            {userRole === 'Admin' && data?.aiStats && (
                                <button type="button" className={`${styles.optionBtn} ${printSections.ai ? styles.optionSelected : ''}`} onClick={() => setPrintSections(s => ({ ...s, ai: !s.ai }))}>
                                    <div className={`${styles.checkControl} ${printSections.ai ? styles.checked : ''}`}>
                                        {printSections.ai && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>}
                                    </div>
                                    <span className={styles.optionLabel}>Использование ИИ</span>
                                </button>
                            )}

                            {userRole === 'Admin' && (
                                <button type="button" className={`${styles.optionBtn} ${printSections.courses ? styles.optionSelected : ''}`} onClick={() => setPrintSections(s => ({ ...s, courses: !s.courses }))}>
                                    <div className={`${styles.checkControl} ${printSections.courses ? styles.checked : ''}`}>
                                        {printSections.courses && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>}
                                    </div>
                                    <span className={styles.optionLabel}>Популярность курсов</span>
                                </button>
                            )}

                            <button type="button" className={`${styles.optionBtn} ${printSections.timeline ? styles.optionSelected : ''}`} onClick={() => setPrintSections(s => ({ ...s, timeline: !s.timeline }))}>
                                <div className={`${styles.checkControl} ${printSections.timeline ? styles.checked : ''}`}>
                                    {printSections.timeline && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>}
                                </div>
                                <span className={styles.optionLabel}>Хронология событий</span>
                            </button>
                        </div>

                        <div className={styles.printModalFooter}>
                            <button className={styles.btnCancel} onClick={() => setIsPrintModalOpen(false)}>Отмена</button>
                            <button className={styles.btnConfirm} onClick={handleConfirmPrint}>
                                <span className="material-symbols-outlined">print</span>
                                Сформировать отчет
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className={styles.headerSection}>
                <div>
                    <h1>Детальная статистика</h1>
                    <p>Анализ метрик, рейтинги клиентов и вовлеченность.</p>
                </div>

                <div className={styles.headerActions}>
                    <div className={styles.filterGroup}>
                        <button className={filter === '7d' ? styles.active : ''} onClick={() => setFilter('7d')}>За 7 дней</button>
                        <button className={filter === '30d' ? styles.active : ''} onClick={() => setFilter('30d')}>За 30 дней</button>
                        <button className={filter === 'all' ? styles.active : ''} onClick={() => setFilter('all')}>За все время</button>
                    </div>
                    <button className={styles.printBtn} onClick={() => setIsPrintModalOpen(true)} title="Сформировать отчет">
                        <span className="material-symbols-outlined">print</span>
                        Печать
                    </button>
                </div>
            </section>

            {loading ? (
                <div className={styles.loaderContainer}>
                    <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                    <p>Анализируем данные...</p>
                </div>
            ) : (
                <>
                    {userRole === 'Admin' && (
                        <section className={`${styles.statsGrid} ${!printSections.overview ? styles.noPrint : ''}`}>
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
                    )}

                    <section className={styles.bentoGridTop}>
                        {userRole === 'Admin' && (
                            <div className={`${styles.panel} ${!printSections.topStudents ? styles.noPrint : ''}`}>
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
                        )}

                        <div className={`${styles.panel} ${!printSections.riskZones ? styles.noPrint : ''}`}>
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

                        {userRole === 'Admin' && data?.aiStats && (
                            <div className={`${styles.panel} ${!printSections.ai ? styles.noPrint : ''}`}>
                                <div className={styles.panelHeader} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <h2>Использование ИИ</h2>
                                    <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>smart_toy</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Тестов сгенерировано</span>
                                        <span style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>{data.aiStats.totalGenerated}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Всего токенов</span>
                                        <span style={{ fontSize: '1.25rem', color: '#8b5cf6', fontWeight: 700 }}>{data.aiStats.totalTokens.toLocaleString('ru-RU')}</span>
                                    </div>

                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                            <span>Промпт ({data.aiStats.promptTokens.toLocaleString('ru-RU')})</span>
                                            <span>Ответ ({data.aiStats.completionTokens.toLocaleString('ru-RU')})</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                            <div style={{
                                                width: `${(data.aiStats.promptTokens / (data.aiStats.totalTokens || 1)) * 100}%`,
                                                backgroundColor: '#cbd5e1'
                                            }}></div>
                                            <div style={{
                                                width: `${(data.aiStats.completionTokens / (data.aiStats.totalTokens || 1)) * 100}%`,
                                                backgroundColor: '#8b5cf6'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className={styles.bentoGridBottom}>
                        {userRole === 'Admin' && (
                            <div className={`${styles.panel} ${!printSections.courses ? styles.noPrint : ''}`}>
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
                        )}

                        <div className={`${styles.panel} ${!printSections.timeline ? styles.noPrint : ''}`}>
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