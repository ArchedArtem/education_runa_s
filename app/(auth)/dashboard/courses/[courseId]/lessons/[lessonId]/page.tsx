"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import styles from './lesson.module.scss';

const COURSE_INFO = {
    id: 'c-1',
};

const LESSON_DATA = {
    id: 'l-3',
    title: 'Настройка начальных остатков предприятия',
    content: `
        <h2>Инструкция по вводу данных</h2>
        <p>Перед началом работы убедитесь, что у вас подготовлена оборотно-сальдовая ведомость.</p>
        <ul>
            <li>Проверьте счета 01, 02 и 10.</li>
            <li>Используйте помощник ввода остатков.</li>
        </ul>
    `,
    videoUrl: 'https://example.com/video.mp4',
    isCompleted: false,
    hasTest: true,
};

const ATTACHMENTS = [
    { id: 1, name: 'Шаблон_импорта.xlsx', size: '156 KB', icon: 'table' },
    { id: 2, name: 'Справочник_счетов.pdf', size: '2.1 MB', icon: 'picture_as_pdf' },
];

const PLAYLIST = [
    { id: 'l-1', title: 'Введение и интерфейс программы', duration: '08:15', isCompleted: true, isCurrent: false, hasTest: false },
    { id: 'l-2', title: 'Заполнение реквизитов организации', duration: '12:05', isCompleted: true, isCurrent: false, hasTest: true },
    { id: 'l-3', title: 'Настройка начальных остатков предприятия', duration: '14:20', isCompleted: false, isCurrent: true, hasTest: true },
    { id: 'l-4', title: 'Учет кассовых и банковских операций', duration: '22:10', isCompleted: false, isCurrent: false, hasTest: false },
];

export default function LessonPage() {
    const router = useRouter();
    const [isCompleted, setIsCompleted] = useState(LESSON_DATA.isCompleted);
    const [activeTab, setActiveTab] = useState<'playlist' | 'materials'>('playlist');

    const handleActionClick = () => {
        if (LESSON_DATA.hasTest) {
            router.push(`/dashboard/courses/${COURSE_INFO.id}/lessons/${LESSON_DATA.id}/test`);
        } else {
            setIsCompleted(!isCompleted);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.layoutGrid}>

                <div className={styles.contentCol}>
                    {LESSON_DATA.videoUrl && (
                        <section className={styles.videoContainer}>
                            <video controls src={LESSON_DATA.videoUrl} />
                        </section>
                    )}

                    <section className={styles.lessonHeader}>
                        <h1 className={styles.lessonTitle}>
                            {LESSON_DATA.title}
                        </h1>

                        <div className={styles.actionGroup}>
                            <button
                                onClick={handleActionClick}
                                className={`${styles.btnAction} ${
                                    LESSON_DATA.hasTest
                                        ? styles.btnTest
                                        : isCompleted ? styles.btnCompleted : styles.btnNotCompleted
                                }`}
                            >
                                <span className="material-symbols-outlined">
                                    {LESSON_DATA.hasTest ? 'quiz' : isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                {LESSON_DATA.hasTest ? 'Пройти тест' : isCompleted ? 'Пройдено' : 'Завершить'}
                            </button>

                            <button className={`${styles.btnAction} ${styles.btnNext}`}>
                                Далее
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </section>

                    {LESSON_DATA.content && (
                        <section>
                            <h2 className={styles.sectionLabel}>
                                <span className="material-symbols-outlined">description</span>
                                Конспект урока
                            </h2>
                            <div
                                className={styles.textContent}
                                dangerouslySetInnerHTML={{ __html: LESSON_DATA.content }}
                            />
                        </section>
                    )}
                </div>

                <div className={styles.sidebarCol}>
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarTabs}>
                            <button
                                onClick={() => setActiveTab('playlist')}
                                className={`${styles.tabBtn} ${activeTab === 'playlist' ? styles.tabBtnActive : ''}`}
                            >
                                Содержание
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`${styles.tabBtn} ${activeTab === 'materials' ? styles.tabBtnActive : ''}`}
                            >
                                Файлы ({ATTACHMENTS.length})
                            </button>
                        </div>

                        {activeTab === 'playlist' && (
                            <div className={styles.sidebarScroll}>
                                {PLAYLIST.map((lesson, index) => (
                                    <Link
                                        href={`/dashboard/courses/${COURSE_INFO.id}/lessons/${lesson.id}`}
                                        key={lesson.id}
                                        className={`${styles.playlistItem} ${lesson.isCurrent ? styles.playlistItemCurrent : ''}`}
                                    >
                                        <div className={styles.statusIcon}>
                                            {lesson.isCompleted ? (
                                                <span className={`material-symbols-outlined ${styles.iconCheck}`}>check_circle</span>
                                            ) : lesson.isCurrent ? (
                                                <span className={`material-symbols-outlined ${styles.iconPlay}`}>play_circle</span>
                                            ) : (
                                                <span className={styles.iconIndex}>{index + 1}</span>
                                            )}
                                        </div>
                                        <div className={styles.playlistText}>
                                            <span className={`${styles.playlistTitle} ${lesson.isCurrent ? styles.titleCurrent : styles.titleOther}`}>
                                                {lesson.title}
                                            </span>
                                            <div className={styles.playlistMeta}>
                                                <span className={styles.metaItem}>
                                                    <span className="material-symbols-outlined">schedule</span>
                                                    {lesson.duration}
                                                </span>
                                                {lesson.hasTest && (
                                                    <span className={styles.badgeTest}>
                                                        <span className="material-symbols-outlined">quiz</span>
                                                        Тест
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <div className={styles.sidebarScroll}>
                                {ATTACHMENTS.length > 0 ? (
                                    ATTACHMENTS.map(file => (
                                        <a
                                            href="#"
                                            key={file.id}
                                            className={styles.materialItem}
                                        >
                                            <div className={styles.fileInfo}>
                                                <div className={styles.fileIconBox}>
                                                    <span className="material-symbols-outlined">{file.icon}</span>
                                                </div>
                                                <div className={styles.fileText}>
                                                    <span className={styles.fileName}>{file.name}</span>
                                                    <span className={styles.fileSize}>{file.size}</span>
                                                </div>
                                            </div>
                                            <span className={`material-symbols-outlined ${styles.downloadIcon}`}>download</span>
                                        </a>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <span className="material-symbols-outlined">folder_off</span>
                                        <p>К этому уроку нет файлов</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}