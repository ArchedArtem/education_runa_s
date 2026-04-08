"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './courses.module.scss';

type Course = {
    id: number;
    title: string;
    description: string;
    software_product: string;
    thumbnail_url: string;
    lessonsCount: number;
};

const FILTERS = ['Все продукты', '1С:Бухгалтерия', '1С:ЗУП', '1С:УТ'];

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Все продукты');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                if (!res.ok) throw new Error('Ошибка при загрузке курсов');
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
                    {FILTERS.map((filter) => (
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