"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './lessons.module.scss';
import ConfirmModal from '@/app/components/UI/ConfirmModal/ConfirmModal';
import { useToast } from '@/app/components/Providers/ToastProvider';

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
    const [originalLessons, setOriginalLessons] = useState<LessonItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<{ id: number; title: string } | null>(null);

    const [isReordering, setIsReordering] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const res = await fetch(`/api/admin/courses/${courseId}/lessons`);
                if (!res.ok) throw new Error('Ошибка сервера при загрузке уроков');
                const data = await res.json();
                setLessons(data);
            } catch (error) {
                console.error(error);
                showToast('Не удалось загрузить список уроков', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchLessons();
        }
    }, [courseId, showToast]);

    const confirmDelete = (id: number, title: string) => {
        setLessonToDelete({ id, title });
        setIsDeleteModalOpen(true);
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setLessonToDelete(null);
    };

    const executeDelete = async () => {
        if (!lessonToDelete) return;

        try {
            const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonToDelete.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Ошибка при удалении урока');

            const deletedLesson = lessons.find(l => l.id === lessonToDelete.id);
            if (deletedLesson) {
                setLessons(prev =>
                    prev
                        .filter(l => l.id !== lessonToDelete.id)
                        .map(l => l.order > deletedLesson.order ? { ...l, order: l.order - 1 } : l)
                );
            }
            showToast('Урок успешно удален', 'success');

        } catch (error) {
            console.error(error);
            showToast('Не удалось удалить урок. Проверьте консоль.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setLessonToDelete(null);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (!isReordering) return;
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (!isReordering || draggedIndex === null || draggedIndex === index) return;

        const newLessons = [...lessons];
        const draggedLesson = newLessons[draggedIndex];
        newLessons.splice(draggedIndex, 1);
        newLessons.splice(index, 0, draggedLesson);

        const updatedLessons = newLessons.map((lesson, idx) => ({
            ...lesson,
            order: idx + 1
        }));

        setLessons(updatedLessons);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const res = await fetch(`/api/admin/courses/${courseId}/lessons/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessons: lessons.map(l => ({ id: l.id, order: l.order }))
                })
            });

            if (!res.ok) throw new Error('Ошибка при сохранении порядка');

            showToast('Порядок уроков успешно сохранен', 'success');
            setIsReordering(false);
        } catch (err) {
            console.error(err);
            showToast('Не удалось сохранить порядок', 'error');
        } finally {
            setIsSavingOrder(false);
        }
    };

    const handleCancelReorder = () => {
        setLessons(originalLessons);
        setIsReordering(false);
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
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Удаление урока"
                message={`Вы действительно хотите безвозвратно удалить урок "${lessonToDelete?.title}"? Все материалы, видео и тесты к этому уроку будут уничтожены.`}
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={executeDelete}
                onCancel={cancelDelete}
                isDangerous={true}
            />

            <section className={styles.headerSection}>
                <div className={styles.titleGroup}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.mainTitle}>Программа курса</h1>
                        <span className={styles.countBadge}>{lessons.length}</span>
                    </div>
                    <p className={styles.subtitle}>Управление списком уроков, материалами и тестированием.</p>
                </div>

                <div className={styles.headerActions}>
                    {isReordering ? (
                        <>
                            <button onClick={handleCancelReorder} className={styles.btnSecondary}>
                                Отмена
                            </button>
                            <button onClick={handleSaveOrder} disabled={isSavingOrder} className={styles.btnPrimary}>
                                <span className={`material-symbols-outlined text-[20px] ${isSavingOrder ? styles.spinIcon : ''}`}>
                                    {isSavingOrder ? 'autorenew' : 'save'}
                                </span>
                                {isSavingOrder ? 'Сохранение...' : 'Сохранить порядок'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setOriginalLessons(lessons);
                                    setIsReordering(true);
                                    setSearchQuery('');
                                }}
                                className={styles.btnSort}
                            >
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
                        </>
                    )}
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
                        disabled={isReordering}
                    />
                </div>
            </section>

            <section className={styles.lessonsList}>
                {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson, index) => (
                        <div
                            key={lesson.id}
                            className={`${styles.lessonCard} ${isReordering ? 'cursor-move' : ''}`}
                            style={{
                                opacity: draggedIndex === index ? 0.5 : 1,
                                outline: isReordering ? '2px dashed #bfdbfe' : 'none',
                                outlineOffset: '2px',
                                transition: 'all 0.2s ease'
                            }}
                            draggable={isReordering}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className={styles.lessonInfo}>
                                <div className={styles.dragHandle} style={{ cursor: isReordering ? 'grab' : 'default', color: isReordering ? '#2563eb' : '#cbd5e1' }}>
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
                                    style={{ pointerEvents: isReordering ? 'none' : 'auto', opacity: isReordering ? 0.5 : 1 }}
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                    Ред.
                                </Link>
                                <button
                                    onClick={() => confirmDelete(lesson.id, lesson.title)}
                                    className={styles.deleteBtn}
                                    disabled={isReordering}
                                    style={{ pointerEvents: isReordering ? 'none' : 'auto', opacity: isReordering ? 0.5 : 1 }}
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