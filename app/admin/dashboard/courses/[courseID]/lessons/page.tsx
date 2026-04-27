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
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<{ id: number; title: string } | null>(null);

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
                                    onClick={() => confirmDelete(lesson.id, lesson.title)}
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