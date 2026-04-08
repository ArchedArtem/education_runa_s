"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './lessons.module.scss';

type LessonItem = {
    id: number;
    order: number;
    title: string;
    duration: string;
    hasVideo: boolean;
    hasText: boolean;
    hasFiles: boolean;
    hasTest: boolean;
    isPublished: boolean;
};

export default function AdminLessonsPage() {
    const params = useParams();
    const courseId = (params.courseId || params.courseID || params.id) as string;

    const [lessons, setLessons] = useState<LessonItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const res = await fetch(`/api/admin/courses/${courseId}/lessons`);
                if (!res.ok) throw new Error('Ошибка сервера при загрузке уроков');
                const data = await res.json();
                setLessons(data);
            } catch (error) {
                console.error(error);
                alert('Не удалось загрузить список уроков');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchLessons();
        }
    }, [courseId]);

    const handleDelete = async (lessonId: number, lessonTitle: string) => {
        if (confirm(`Вы действительно хотите удалить урок "${lessonTitle}"?\nЭто действие необратимо и удалит все материалы и тесты к уроку.`)) {
            try {
                const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
                    method: 'DELETE'
                });

                if (!res.ok) throw new Error('Ошибка при удалении урока');

                setLessons(prevLessons => prevLessons.filter(l => l.id !== lessonId));

            } catch (error) {
                alert('Не удалось удалить урок. Проверьте консоль.');
            }
        }
    };

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className={`${styles.pageContainer} flex items-center justify-center min-h-[50vh]`}>
                <div className="flex flex-col items-center text-slate-400 gap-3">
                    <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
                    <p className="font-medium">Загрузка программы курса...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <section className={styles.headerSection}>
                <div className={styles.titleGroup}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.mainTitle}>Программа курса</h1>
                        <span className={styles.countBadge}>{lessons.length}</span>
                    </div>
                    <p className={styles.subtitle}>Управление списком уроков, материалами и тестированием.</p>
                </div>

                <div className={styles.headerActions}>
                    <button className={styles.btnSort}>
                        <span className="material-symbols-outlined">sort</span>
                        Изменить порядок
                    </button>
                    <Link
                        href={`/admin/dashboard/courses/${courseId}/lessons/new`}
                        className={styles.btnCreate}
                    >
                        <span className="material-symbols-outlined">add</span>
                        Новый урок
                    </Link>
                </div>
            </section>

            <section className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                    <input
                        type="text"
                        placeholder="Поиск урока по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </section>

            <section className={styles.lessonsList}>
                {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson) => (
                        <div key={lesson.id} className={styles.lessonCard}>
                            <div className={styles.lessonInfo}>
                                <div className={styles.dragHandle}>
                                    <span className="material-symbols-outlined">drag_indicator</span>
                                </div>

                                <div className={styles.orderNumber}>
                                    {lesson.order}
                                </div>

                                <div className={styles.textDetails}>
                                    <div className={styles.titleLine}>
                                        <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                                        {!lesson.isPublished && (
                                            <span className={styles.draftBadge}>Черновик</span>
                                        )}
                                    </div>

                                    <div className={styles.metaData}>
                                        <div className={`${styles.metaItem} ${lesson.hasVideo ? styles.activeVideo : ''}`}>
                                            <span className="material-symbols-outlined">{lesson.hasVideo ? 'play_circle' : 'videocam_off'}</span>
                                            {lesson.duration}
                                        </div>
                                        <div className={`${styles.metaItem} ${lesson.hasText ? styles.activeText : ''}`}>
                                            <span className="material-symbols-outlined">article</span>
                                            Конспект
                                        </div>
                                        <div className={`${styles.metaItem} ${lesson.hasFiles ? styles.activeFiles : ''}`}>
                                            <span className="material-symbols-outlined">attach_file</span>
                                            Файлы
                                        </div>
                                        <div className={`${styles.metaItem} ${lesson.hasTest ? styles.activeTest : ''}`}>
                                            <span className="material-symbols-outlined">quiz</span>
                                            Тест
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <Link
                                    href={`/admin/dashboard/courses/${courseId}/lessons/${lesson.id}/edit`}
                                    className={styles.editBtn}
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                    Ред.
                                </Link>
                                <button
                                    onClick={() => handleDelete(lesson.id, lesson.title)}
                                    className={styles.deleteBtn}
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <span className="material-symbols-outlined">menu_book</span>
                        <h3>Уроков пока нет</h3>
                        <p>Вы еще не добавили ни одного урока в этот курс. Нажмите «Новый урок», чтобы начать.</p>
                    </div>
                )}
            </section>
        </div>
    );
}