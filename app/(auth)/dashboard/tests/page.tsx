"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './tests.module.scss';

type TestAvailable = {
    id: number;
    title: string;
    courseName: string;
    courseId: number;
    lessonId: number;
    passingScore: number;
    maxScore: number;
};

type TestHistory = {
    id: number;
    testId: number;
    title: string;
    courseId: number;
    lessonId: number;
    attemptDate: string;
    score: number;
    maxScore: number;
    isPassed: boolean;
};

export default function TestsPage() {
    const [availableTests, setAvailableTests] = useState<TestAvailable[]>([]);
    const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestsData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch('/api/user/tests', { headers });
                if (!res.ok) throw new Error('Ошибка загрузки тестов');

                const data = await res.json();
                setAvailableTests(data.availableTests);
                setTestHistory(data.testHistory);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTestsData();
    }, []);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loaderContainer}>
                    <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                    <p>Загружаем данные тестирования...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.headerSection}>
                <h1>Тестирования</h1>
                <p>Проверка знаний и история ваших результатов.</p>
            </section>

            <section>
                <h2 className={styles.sectionTitle}>Доступные для прохождения</h2>
                {availableTests.length > 0 ? (
                    <div className={styles.gridAvailable}>
                        {availableTests.map(test => (
                            <div key={test.id} className={styles.cardAvailable}>
                                <div className={styles.cardTop}>
                                    <div className={styles.iconBox}>
                                        <span className="material-symbols-outlined">assignment</span>
                                    </div>
                                    <div>
                                        <h3>{test.title}</h3>
                                        <p>{test.courseName}</p>
                                    </div>
                                </div>

                                <div className={styles.cardBottom}>
                                    <div className={styles.scoreInfo}>
                                        <span className={styles.scoreLabel}>Проходной балл</span>
                                        <span className={styles.scoreValue}>{test.passingScore} из {test.maxScore}</span>
                                    </div>
                                    <Link
                                        href={`/dashboard/courses/${test.courseId}/lessons/${test.lessonId}/test`}
                                        className={styles.btnPrimary}
                                    >
                                        Начать тест
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyState}>У вас нет не пройденных тестов на данный момент.</p>
                )}
            </section>

            <section>
                <h2 className={styles.sectionTitle}>История попыток</h2>
                {testHistory.length > 0 ? (
                    <div className={styles.historyList}>
                        {testHistory.map(history => (
                            <div key={history.id} className={styles.historyCard}>
                                <div className={styles.historyMain}>
                                    <h3>{history.title}</h3>
                                    <div className={styles.dateInfo}>
                                        <span className="material-symbols-outlined">calendar_today</span>
                                        <span>{new Date(history.attemptDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div className={styles.historyControls}>
                                    <div className={`${styles.badge} ${history.isPassed ? styles.success : styles.error}`}>
                                        <span className="material-symbols-outlined">
                                            {history.isPassed ? 'check_circle' : 'cancel'}
                                        </span>
                                        {history.isPassed ? 'Сдан' : 'Не сдан'}
                                    </div>

                                    <div className={styles.scoreBlock}>
                                        <span className={styles.scoreBig}>{history.score}</span>
                                        <span className={styles.scoreSmall}>/{history.maxScore}</span>
                                    </div>

                                    <div className={styles.btnWrapper}>
                                        {history.isPassed ? (
                                            <button className={styles.btnOutline} disabled title="Тест уже успешно сдан">
                                                Сдано
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/dashboard/courses/${history.courseId}/lessons/${history.lessonId}/test`}
                                                className={styles.btnPrimary}
                                                style={{ width: '100%', display: 'flex' }}
                                            >
                                                Пересдать
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyState}>История тестирований пуста.</p>
                )}
            </section>
        </div>
    );
}