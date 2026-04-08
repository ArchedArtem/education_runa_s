"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './lessons.module.scss';

const MOCK_LESSONS = [
    {
        id: 'l-1',
        order: 1,
        title: 'Введение и интерфейс программы',
        duration: '08:15',
        hasVideo: true,
        hasText: true,
        hasFiles: true,
        hasTest: false,
        isPublished: true,
    },
    {
        id: 'l-2',
        order: 2,
        title: 'Заполнение реквизитов организации',
        duration: '12:05',
        hasVideo: true,
        hasText: true,
        hasFiles: true,
        hasTest: true,
        isPublished: true,
    },
    {
        id: 'l-3',
        order: 3,
        title: 'Настройка начальных остатков предприятия',
        duration: '14:20',
        hasVideo: true,
        hasText: false,
        hasFiles: true,
        hasTest: true,
        isPublished: false,
    },
    {
        id: 'l-4',
        order: 4,
        title: 'Учет кассовых и банковских операций',
        duration: '00:00',
        hasVideo: false,
        hasText: true,
        hasFiles: false,
        hasTest: false,
        isPublished: false,
    }
];

export default function AdminLessonsPage() {
    const params = useParams();
    const courseId = params.courseID as string;

    const [lessons] = useState(MOCK_LESSONS);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                <button className={styles.deleteBtn}>
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