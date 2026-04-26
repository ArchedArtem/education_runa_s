"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './tests.module.scss';

type TestRecord = {
    id: number;
    title: string;
    passingScore: number;
    questionsCount: number;
    lessonId: number;
    lessonName: string;
    courseId: number;
    courseName: string;
    softwareProduct: string;
    isPublished: boolean;
};

export default function AdminTestsPage() {
    const [tests, setTests] = useState<TestRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('All');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch('/api/admin/tests', { headers });
            if (!res.ok) throw new Error('Ошибка загрузки тестов');

            const data = await res.json();
            setTests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (testId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот тест? Он будет удален из урока.')) return;

        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`/api/admin/tests?id=${testId}`, { method: 'DELETE', headers });
            if (res.ok) {
                setTests(prev => prev.filter(t => t.id !== testId));
            } else {
                alert('Ошибка при удалении');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const uniqueProducts = ['All', ...Array.from(new Set(tests.map(t => t.softwareProduct)))];

    const filteredTests = tests.filter(test => {
        const matchesSearch =
            test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.lessonName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCourse = courseFilter === 'All' || test.softwareProduct === courseFilter;

        return matchesSearch && matchesCourse;
    });

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.headerSection}>
                <h1>База тестов</h1>
                <p>Управление тестированиями, привязанными к урокам.</p>
            </section>

            <section className={styles.filtersSection}>
                <div className={styles.searchBox}>
                    <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                    <input
                        type="text"
                        placeholder="Поиск по тесту, курсу или уроку..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.filterTabs}>
                    {uniqueProducts.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setCourseFilter(filter)}
                            className={`${styles.tabBtn} ${courseFilter === filter ? styles.active : ''}`}
                        >
                            {filter === 'All' ? 'Все продукты' : filter}
                        </button>
                    ))}
                </div>
            </section>

            {isLoading ? (
                <div className={styles.loaderContainer}>
                    <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                    <p>Загружаем базу тестов...</p>
                </div>
            ) : (
                <section className={styles.testList}>
                    {filteredTests.length > 0 ? (
                        filteredTests.map((test) => (
                            <div key={test.id} className={styles.testCard}>

                                <div className={styles.cardMain}>
                                    <div className={styles.cardIcon}>
                                        <span className="material-symbols-outlined">quiz</span>
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <div className={styles.titleRow}>
                                            <h2 className={styles.testTitle} title={test.title}>{test.title}</h2>
                                            <span className={`${styles.badge} ${test.isPublished ? styles.active : styles.draft}`}>
                                                {test.isPublished ? 'Активен' : 'Черновик'}
                                            </span>
                                        </div>
                                        <p className={styles.lessonName} title={`${test.courseName} / ${test.lessonName}`}>
                                            <span className="material-symbols-outlined">menu_book</span>
                                            {test.courseName} / {test.lessonName}
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.statsBlock}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Вопросов</span>
                                        <div className={styles.statValue}>
                                            <span className="material-symbols-outlined">format_list_bulleted</span>
                                            <span>{test.questionsCount}</span>
                                        </div>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Проходной балл</span>
                                        <div className={styles.statValue}>
                                            <span className="material-symbols-outlined">done_all</span>
                                            <span>{test.passingScore}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    {test.courseId && test.lessonId ? (
                                        <Link
                                            href={`/admin/dashboard/courses/${test.courseId}/lessons/${test.lessonId}/edit?tab=test`}
                                            className={styles.btnEdit}
                                        >
                                            <span className="material-symbols-outlined">edit_note</span>
                                            В урок
                                        </Link>
                                    ) : (
                                        <span className="text-sm text-red-500 font-bold">Урок не найден</span>
                                    )}

                                    <button
                                        className={styles.btnDelete}
                                        title="Удалить тест"
                                        onClick={() => handleDelete(test.id)}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <span className="material-symbols-outlined">search_off</span>
                            <h3>Тесты не найдены</h3>
                            <p>Попробуйте изменить параметры поиска или фильтра.</p>
                            <button onClick={() => { setSearchQuery(''); setCourseFilter('All'); }}>
                                Сбросить фильтры
                            </button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}