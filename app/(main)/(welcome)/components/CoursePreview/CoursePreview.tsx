"use client";

import { useRef } from 'react';
import styles from './CoursePreview.module.scss';

const COURSES = [
    { id: 1, title: '1С:Бухгалтерия 8.3', status: 'in-progress', progress: 65, actionText: 'Продолжить' },
    { id: 2, title: '1С:ЗУП', status: 'new', progress: 0, actionText: 'Начать курс' },
    { id: 3, title: '1С:Управление торговлей', status: 'new', progress: 0, actionText: 'Начать курс' },
    { id: 4, title: 'Складской учет', status: 'completed', progress: 100, actionText: 'Повторить' },
    { id: 5, title: 'Складской учет (Продвинутый)', status: 'new', progress: 0, actionText: 'Начать курс' }
];

export default function CoursePreview() {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth / 2;

            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Доступные программы</h2>
                    <div className={styles.navBtns}>
                        <button onClick={() => scroll('left')}>
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button onClick={() => scroll('right')}>
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className={styles.grid} ref={sliderRef}>
                    {COURSES.map((course) => (
                        <div key={course.id} className={styles.courseCard}>
                            <div className={styles.imageWrapper}>
                                <div className={`${styles.imageOverlay} bg-slate-200`}></div>
                                <div className={styles.tags}>
                                    <span className={styles.tag} style={{ backgroundColor: '#ffdad6', color: '#8f000a' }}>1C</span>
                                    {course.status === 'in-progress' && (
                                        <span className={styles.tag} style={{ backgroundColor: 'rgba(81, 95, 116, 0.1)', color: '#515f74' }}>В процессе</span>
                                    )}
                                    {course.status === 'completed' && (
                                        <span className={styles.tag} style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>Завершено</span>
                                    )}
                                </div>
                            </div>

                            <h4 className={styles.courseTitle}>{course.title}</h4>

                            <div className={styles.progressBlock}>
                                <div className={styles.progressHeader}>
                                    <span>Прогресс</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div className={styles.track}>
                                    <div
                                        className={styles.bar}
                                        style={{
                                            width: `${course.progress}%`,
                                            backgroundColor: course.status === 'completed' ? '#22c55e' : '#0037b0'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <button className={styles.actionBtn}>
                                {course.actionText} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}