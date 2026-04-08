"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styles from './course.module.scss';

type Lesson = { id: number; title: string; is_completed: boolean };
type CourseDetail = {
    id: number;
    title: string;
    description: string;
    software_product: string;
    thumbnail_url: string;
    authors: string;
    lessons: Lesson[];
};

export default function CourseOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const res = await fetch(`/api/courses/${courseId}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setCourse(data);
            } catch (err) {
                router.push('/dashboard/courses');
            } finally {
                setIsLoading(false);
            }
        };
        if (courseId) fetchCourseData();
    }, [courseId, router]);

    if (isLoading || !course) {
        return (
            <div className={styles.loader}>
                <span className="material-symbols-outlined animate-spin">autorenew</span>
                <p>Загрузка курса...</p>
            </div>
        );
    }

    const totalLessons = course.lessons.length;
    const completedCount = course.lessons.filter(l => l.is_completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isAllLessonsCompleted = completedCount === totalLessons && totalLessons > 0;

    return (
        <div className={styles.pageContainer}>
            <section className={styles.heroBanner} style={{ backgroundImage: `url(${course.thumbnail_url})` }}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <div className={styles.productTag}>
                        <div className={styles.dot}></div>
                        {course.software_product}
                    </div>
                    <h1 className={styles.courseTitle}>{course.title}</h1>
                    <div className={styles.authorsInfo}>
                        <span className="material-symbols-outlined">group</span>
                        Авторы: {course.authors}
                    </div>
                </div>
            </section>

            <div className={styles.mainGrid}>
                <div className={styles.contentCol}>
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>Детальное описание курса</h2>
                        <p className={styles.descriptionText}>{course.description}</p>
                    </section>

                    <section className={styles.sectionCard}>
                        <div className={styles.programHeader}>
                            <h2 className={styles.sectionTitle}>Программа</h2>
                            <span className={styles.countBadge}>{completedCount} / {totalLessons} пройдено</span>
                        </div>
                        <div className={styles.lessonList}>
                            {course.lessons.map((lesson, index) => (
                                <Link
                                    href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                                    key={lesson.id}
                                    className={`${styles.lessonItem} ${lesson.is_completed ? styles.lessonCompleted : ''}`}
                                >
                                    <div className={styles.lessonInfo}>
                                        <div className={`${styles.statusIcon} ${lesson.is_completed ? styles.iconCompleted : styles.iconNotCompleted}`}>
                                            <span className="material-symbols-outlined">{lesson.is_completed ? 'check' : 'play_arrow'}</span>
                                        </div>
                                        <div className={styles.lessonText}>
                                            <span className={styles.lessonIndex}>Урок {index + 1}</span>
                                            <h4 className={styles.lessonTitle}>{lesson.title}</h4>
                                        </div>
                                    </div>
                                    <div className={`${styles.lessonStatusLabel} ${lesson.is_completed ? styles.textGreen : styles.textBlue}`}>
                                        {lesson.is_completed ? 'Пройдено' : 'Начать'}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <div className={styles.sidebarCol}>
                    <div className={styles.progressCard}>
                        <h3 className={styles.sidebarTitle}>Ваш прогресс</h3>
                        <div className={styles.progressInfo}>
                            <span>Освоено</span>
                            <span className={styles.value}>{progressPercentage}%</span>
                        </div>
                        <div className={styles.progressBarContainer}>
                            <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <Link
                            href={`/dashboard/courses/${course.id}/lessons/${course.lessons.find(l => !l.is_completed)?.id || course.lessons[0]?.id}`}
                            className={styles.btnAction}
                        >
                            <span className="material-symbols-outlined">play_circle</span>
                            {completedCount > 0 && completedCount < totalLessons ? 'Продолжить' : 'Начать обучение'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}