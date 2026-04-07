"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CoursePreview.module.scss';

export default function CoursePreview() {
    const sliderRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [isAuth, setIsAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const authRes = await fetch('/api/auth/me');
                setIsAuth(authRes.ok);

                const coursesRes = await fetch('/api/courses');
                if (coursesRes.ok) {
                    const data = await coursesRes.json();
                    setCourses(data);
                }
            } catch (error) {

            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth * 0.8;

            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleCourseClick = (courseId: number) => {
        router.push(`/dashboard/courses/${courseId}`);
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Доступные программы</h2>
                    <div className={styles.navBtns}>
                        <button onClick={() => scroll('left')} aria-label="Назад" disabled={isLoading || courses.length === 0}>
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button onClick={() => scroll('right')} aria-label="Вперед" disabled={isLoading || courses.length === 0}>
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className={styles.grid} ref={sliderRef}>
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={`skeleton-${index}`} className={`${styles.courseCard} animate-pulse`}>
                                <div className={`${styles.imageWrapper} bg-slate-200`}></div>
                                <div className="h-6 bg-slate-200 rounded-md w-3/4 mt-4 mb-3"></div>
                                <div className="h-4 bg-slate-200 rounded-md w-1/2 mb-6"></div>
                                <div className="mt-auto h-10 bg-slate-200 rounded-lg w-full"></div>
                            </div>
                        ))
                    ) : courses.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-2xl border border-slate-100 col-span-full">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">school</span>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Нет доступных курсов</h3>
                            <p className="text-slate-500 max-w-md">
                                В данный момент на платформе нет опубликованных учебных программ. Пожалуйста, загляните позже.
                            </p>
                        </div>
                    ) : (
                        courses.map((course) => {
                            const progress = course.progress || 0;
                            const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'new';
                            const actionText = !isAuth ? 'Начать курс' : (status === 'completed' ? 'Повторить' : (status === 'in-progress' ? 'Продолжить' : 'Начать курс'));

                            return (
                                <div
                                    key={course.id}
                                    className={`${styles.courseCard} cursor-pointer group`}
                                    onClick={() => handleCourseClick(course.id)}
                                >
                                    <div className={styles.imageWrapper}>
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className={`${styles.imageOverlay} bg-slate-200 absolute inset-0`}></div>
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                                        <div className={`${styles.tags} z-20`}>
                                            <span className={styles.tag} style={{ backgroundColor: '#ffdad6', color: '#8f000a' }}>
                                                {course.software_product || '1C'}
                                            </span>
                                            {isAuth && status === 'in-progress' && (
                                                <span className={styles.tag} style={{ backgroundColor: 'rgba(81, 95, 116, 0.9)', color: '#ffffff' }}>В процессе</span>
                                            )}
                                            {isAuth && status === 'completed' && (
                                                <span className={styles.tag} style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>Завершено</span>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className={styles.courseTitle}>{course.title}</h4>

                                    {isAuth && (
                                        <div className={styles.progressBlock}>
                                            <div className={styles.progressHeader}>
                                                <span>Прогресс</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className={styles.track}>
                                                <div
                                                    className={styles.bar}
                                                    style={{
                                                        width: `${progress}%`,
                                                        backgroundColor: status === 'completed' ? '#22c55e' : '#0037b0'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <button className={styles.actionBtn}>
                                        {actionText} <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                    {courses.length > 0 && <div className={styles.spacer}></div>}
                </div>
            </div>
        </section>
    );
}