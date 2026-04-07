"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './catalog.module.scss';

type Course = {
    id: number;
    title: string;
    description: string | null;
    software_product: string;
    thumbnail_url: string | null;
};

export default function CatalogPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <main className={styles.pageWrapper}>
            <div className={styles.bgDecorations}>
                <div className={styles.glowBlue}></div>
                <div className={styles.glowGray}></div>
                <div className={styles.floatShape1}></div>
                <div className={styles.floatShape2}></div>
            </div>

            <div className={styles.contentContainer}>
                <section className={styles.heroSection}>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        Учебная программа
                    </h1>
                    <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
                        Каталог доступных образовательных курсов по программным продуктам 1С. Выберите интересующее направление для повышения квалификации и эффективной работы.
                    </p>
                </section>

                {isLoading ? (
                    <div className={styles.bentoGrid}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={`skeleton-${index}`} className={`${styles.glassCard} animate-pulse p-0 overflow-hidden h-full flex flex-col`}>
                                <div className="aspect-video bg-slate-200/50 w-full shrink-0"></div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="h-6 bg-slate-200/50 rounded-md w-3/4 mb-4"></div>
                                    <div className="h-4 bg-slate-200/50 rounded-md w-full mb-2"></div>
                                    <div className="h-4 bg-slate-200/50 rounded-md w-2/3 mb-6"></div>
                                    <div className="h-10 bg-slate-200/50 rounded-lg w-full mt-auto"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-xl shadow-blue-900/5">
                        <span className="material-symbols-outlined text-6xl text-blue-200 mb-6">inventory_2</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Программа формируется</h3>
                        <p className="text-slate-500 max-w-md text-lg">
                            В данный момент список доступных курсов обновляется методистами. Пожалуйста, загляните на эту страницу немного позже.
                        </p>
                    </div>
                ) : (
                    <div className={styles.bentoGrid}>
                        {courses.map((course) => (
                            <Link
                                href={`/dashboard/courses/${course.id}`}
                                key={course.id}
                                className={`${styles.glassCard} group p-0 overflow-hidden flex flex-col cursor-pointer h-full`}
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 shrink-0">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900"></div>
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-blue-800 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                            {course.software_product}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3
                                        className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors"
                                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                    >
                                        {course.title}
                                    </h3>

                                    <p
                                        className="text-sm text-slate-500 leading-relaxed mb-6"
                                        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                    >
                                        {course.description || 'Описание курса отсутствует.'}
                                    </p>

                                    <div className="mt-auto w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 font-bold rounded-xl group-hover:bg-blue-600 group-hover: transition-all duration-300">
                                        Начать обучение
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}