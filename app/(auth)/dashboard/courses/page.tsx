"use client";

import Link from 'next/link';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './courses.module.scss';

type Course = {
    id: number;
    title: string;
    description: string;
    software_product: string;
    thumbnail_url: string;
    lessonsCount: number;
    likesCount: number;
};

function CoursesPageContent() {
    const searchParams = useSearchParams();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [activeFilter, setActiveFilter] = useState('Все продукты');

    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                if (!res.ok) throw new Error();
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const availableFilters = useMemo(() => {
        const products = courses.map(course => course.software_product);
        const uniqueProducts = Array.from(new Set(products)).filter(Boolean);
        return ['Все продукты', ...uniqueProducts];
    }, [courses]);

    const filteredCourses = courses.filter(course => {
        const matchesFilter = activeFilter === 'Все продукты' || course.software_product === activeFilter;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                <p>Загружаем доступные курсы...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.heroSection}>
                <h1>Каталог курсов</h1>
                <p>Обучающие программы по продуктам 1С для сотрудников.</p>
            </section>

            <section className={styles.controlsSection}>
                <div className={styles.searchBox}>
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.filterGroup}>
                    {availableFilters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.coursesGrid}>
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <div key={course.id} className={styles.courseCard}>
                            <div className={styles.thumbnailWrapper}>
                                {course.thumbnail_url?.startsWith('http') ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className={styles.cardImg}
                                    />
                                ) : (
                                    <div className={`${styles.cardImgPlaceholder} ${course.thumbnail_url || ''}`}></div>
                                )}

                                <div className={styles.categoryBadge}>
                                    <div className={styles.statusDot}></div>
                                    <span>{course.software_product}</span>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <h3>{course.title}</h3>

                                <p className={styles.description}>
                                    {course.description || 'Описание курса отсутствует.'}
                                </p>

                                <div className={styles.cardFooter}>
                                    <div className={styles.statsRow}>
                                        <div className={styles.statItem}>
                                            <span className="material-symbols-outlined">play_lesson</span>
                                            <span>{course.lessonsCount} уроков</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className="material-symbols-outlined" style={{ color: '#ef4444', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                            <span>{course.likesCount}</span>
                                        </div>
                                    </div>

                                    <Link href={`/dashboard/courses/${course.id}`} className={styles.actionBtn}>
                                        Перейти к обучению
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <span className="material-symbols-outlined">search_off</span>
                        <h3>Курсы не найдены</h3>
                        <p>Ничего не нашлось. Попробуйте сбросить фильтры.</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveFilter('Все продукты');
                                window.history.replaceState({}, '', '/dashboard/courses');
                            }}
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default function CoursesPage() {
    return (
        <Suspense fallback={
            <div className={styles.pageWrapper}>
                <div className={styles.loaderContainer}>
                    <span className={`material-symbols-outlined ${styles.spinner}`}>autorenew</span>
                    <p>Загрузка страницы...</p>
                </div>
            </div>
        }>
            <CoursesPageContent />
        </Suspense>
    );
}