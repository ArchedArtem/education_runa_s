"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import styles from './lesson.module.scss';

type LessonData = {
    id: number;
    title: string;
    content: string;
    videoUrl: string;
    hasTest: boolean;
    isCompleted: boolean;
    nextLessonId: number | null;
};

type Material = { id: number; name: string; url: string; size: string; icon: string; };
type PlaylistItem = { id: number; title: string; duration: string; isCompleted: boolean; isCurrent: boolean; hasTest: boolean; };

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const [activeTab, setActiveTab] = useState<'playlist' | 'materials'>('playlist');

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`);
                if (!res.ok) throw new Error("Ошибка загрузки урока");
                const data = await res.json();

                setLesson(data.lesson);
                setMaterials(data.materials);
                setPlaylist(data.playlist);
            } catch (err) {
                console.error(err);
                alert("Не удалось загрузить урок");
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId && lessonId) fetchLessonData();
    }, [courseId, lessonId]);

    const handleToggleComplete = async () => {
        if (!lesson || isUpdating) return;
        setIsUpdating(true);
        const newStatus = !lesson.isCompleted;

        try {
            const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: newStatus })
            });

            if (res.ok) {
                setLesson({ ...lesson, isCompleted: newStatus });
                setPlaylist(playlist.map(item =>
                    item.id === lesson.id ? { ...item, isCompleted: newStatus } : item
                ));
            }
        } catch (error) {
            console.error(error);
            alert("Не удалось обновить статус");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleActionClick = () => {
        if (!lesson) return;
        if (lesson.hasTest) {
            router.push(`/dashboard/courses/${courseId}/lessons/${lesson.id}/test`);
        } else {
            handleToggleComplete();
        }
    };

    const renderVideo = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
            return (
                <iframe
                    className="w-full aspect-video rounded-xl"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen>
                </iframe>
            );
        }
        return <video controls src={url} className="w-full rounded-xl" />;
    };

    if (isLoading || !lesson) {
        return (
            <div className={styles.loader}>
                <span className="material-symbols-outlined animate-spin">autorenew</span>
                <p>Загрузка материалов урока...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.layoutGrid}>

                <div className={styles.contentCol}>
                    {lesson.videoUrl && (
                        <section className={styles.videoContainer}>
                            {renderVideo(lesson.videoUrl)}
                        </section>
                    )}

                    <section className={styles.lessonHeader}>
                        <h1 className={styles.lessonTitle}>
                            {lesson.title}
                        </h1>

                        <div className={styles.actionGroup}>
                            <button
                                onClick={handleActionClick}
                                disabled={isUpdating}
                                className={`${styles.btnAction} ${
                                    lesson.hasTest
                                        ? styles.btnTest
                                        : lesson.isCompleted ? styles.btnCompleted : styles.btnNotCompleted
                                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="material-symbols-outlined">
                                    {lesson.hasTest ? 'quiz' : lesson.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                {lesson.hasTest ? 'Пройти тест' : lesson.isCompleted ? 'Пройдено' : 'Завершить'}
                            </button>

                            {lesson.nextLessonId && (
                                <Link href={`/dashboard/courses/${courseId}/lessons/${lesson.nextLessonId}`} className={`${styles.btnAction} ${styles.btnNext}`}>
                                    Далее
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            )}
                        </div>
                    </section>

                    {lesson.content && (
                        <section>
                            <h2 className={styles.sectionLabel}>
                                <span className="material-symbols-outlined">description</span>
                                Конспект урока
                            </h2>
                            <div
                                className={styles.textContent}
                                dangerouslySetInnerHTML={{ __html: lesson.content }}
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
                                Файлы ({materials.length})
                            </button>
                        </div>

                        {activeTab === 'playlist' && (
                            <div className={styles.sidebarScroll}>
                                {playlist.map((item, index) => (
                                    <Link
                                        href={`/dashboard/courses/${courseId}/lessons/${item.id}`}
                                        key={item.id}
                                        className={`${styles.playlistItem} ${item.isCurrent ? styles.playlistItemCurrent : ''}`}
                                    >
                                        <div className={styles.statusIcon}>
                                            {item.isCompleted ? (
                                                <span className={`material-symbols-outlined ${styles.iconCheck}`}>check_circle</span>
                                            ) : item.isCurrent ? (
                                                <span className={`material-symbols-outlined ${styles.iconPlay}`}>play_circle</span>
                                            ) : (
                                                <span className={styles.iconIndex}>{index + 1}</span>
                                            )}
                                        </div>
                                        <div className={styles.playlistText}>
                                            <span className={`${styles.playlistTitle} ${item.isCurrent ? styles.titleCurrent : styles.titleOther}`}>
                                                {item.title}
                                            </span>
                                            <div className={styles.playlistMeta}>
                                                <span className={styles.metaItem}>
                                                    <span className="material-symbols-outlined">schedule</span>
                                                    {item.duration}
                                                </span>
                                                {item.hasTest && (
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
                                {materials.length > 0 ? (
                                    materials.map(file => (
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            key={file.id}
                                            className={styles.materialItem}
                                        >
                                            <div className={styles.fileInfo}>
                                                <div className={styles.fileIconBox}>
                                                    <span className="material-symbols-outlined">{file.icon}</span>
                                                </div>
                                                <div className={styles.fileText}>
                                                    <span className={styles.fileName}>{file.name}</span>
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