"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './courses.module.scss';
import ConfirmModal from '@/app/components/UI/ConfirmModal/ConfirmModal';
import { useToast } from '@/app/components/Providers/ToastProvider';

type Course = {
    id: number;
    title: string;
    description: string | null;
    software_product: string;
    thumbnail_url: string | null;
    is_published: boolean;
    created_at: string;
    _count: {
        lessons: number;
    }
};

function CoursesPageContent() {
    const searchParams = useSearchParams();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    const [statusFilter, setStatusFilter] = useState('All');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<{ id: number; title: string } | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchCoursesAndRole = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const roleRes = await fetch('/api/admin/auth/me', { headers });
                if (roleRes.ok) {
                    const roleData = await roleRes.json();
                    setUserRole(roleData.user?.role?.name?.toLowerCase() || roleData.roleName?.toLowerCase() || 'moderator');
                }

                const res = await fetch('/api/admin/courses', { headers });
                if (!res.ok) throw new Error('Ошибка сервера при загрузке');
                const data = await res.json();
                setCourses(data);
            } catch (error) {
                console.error(error);
                showToast('Не удалось загрузить список курсов', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoursesAndRole();
    }, [showToast]);

    const confirmDelete = (id: number, title: string) => {
        setCourseToDelete({ id, title });
        setIsDeleteModalOpen(true);
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
    };

    const executeDelete = async () => {
        if (!courseToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
                method: 'DELETE',
                headers,
            });

            if (!res.ok) throw new Error('Ошибка при удалении');

            setCourses(courses.filter(course => course.id !== courseToDelete.id));
            showToast('Курс успешно удален', 'success');
        } catch (error) {
            console.error(error);
            showToast('Произошла ошибка при удалении курса', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.software_product.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Published' && course.is_published) ||
            (statusFilter === 'Draft' && !course.is_published);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className={`${styles.container} animate-in fade-in duration-300`}>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Удаление курса"
                message={`Вы действительно хотите безвозвратно удалить курс "${courseToDelete?.title}"? Все уроки и прогресс клиентов будут уничтожены.`}
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={executeDelete}
                onCancel={cancelDelete}
                isDangerous={true}
            />

            <section className={styles.header}>
                <div>
                    <h1 className={styles.title}>Курсы и Уроки</h1>
                    <p className={styles.subtitle}>Управление образовательным контентом платформы.</p>
                </div>

                {userRole === 'admin' && (
                    <Link href="/admin/dashboard/courses/new" className={styles.createButton}>
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Создать курс
                    </Link>
                )}
            </section>

            <section className={styles.filtersBar}>
                <div className={styles.searchWrapper}>
                    <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                    <input
                        type="text"
                        placeholder="Поиск по названию или продукту 1С..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterButtons}>
                    <button
                        onClick={() => setStatusFilter('All')}
                        className={`${styles.filterBtn} ${statusFilter === 'All' ? styles.activeAll : ''}`}
                    >
                        Все курсы
                    </button>
                    <button
                        onClick={() => setStatusFilter('Published')}
                        className={`${styles.filterBtn} ${statusFilter === 'Published' ? styles.activePublished : ''}`}
                    >
                        Опубликованы
                    </button>
                    <button
                        onClick={() => setStatusFilter('Draft')}
                        className={`${styles.filterBtn} ${statusFilter === 'Draft' ? styles.activeDraft : ''}`}
                    >
                        Черновики
                    </button>
                </div>
            </section>

            <section className={styles.courseList}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-3">progress_activity</span>
                        <p className={styles.loadingText}>Загрузка курсов...</p>
                    </div>
                ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <div key={course.id} className={styles.courseCard}>
                            <div className={styles.thumbnail}>
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} />
                                ) : (
                                    <div className={styles.placeholderGradient}></div>
                                )}
                                <div className={styles.overlay}></div>
                                <div className={styles.productTag}>
                                    <div className={styles.dot}></div>
                                    <span>{course.software_product}</span>
                                </div>
                            </div>

                            <div className={styles.content}>
                                <div>
                                    <div className={styles.titleRow}>
                                        <h2 className={styles.courseTitle}>{course.title}</h2>
                                        <div className={`${styles.statusBadge} ${course.is_published ? styles.published : styles.draft}`}>
                                            {course.is_published ? 'Опубликован' : 'Черновик'}
                                        </div>
                                    </div>
                                    <p className={styles.description}>
                                        {course.description || 'Описание отсутствует'}
                                    </p>
                                </div>

                                <div className={styles.meta}>
                                    <div className={styles.metaItem}>
                                        <span className={`material-symbols-outlined ${styles.metaIcon}`}>play_lesson</span>
                                        <span><span className={styles.metaValue}>{course._count.lessons}</span> уроков</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={`material-symbols-outlined ${styles.metaIcon}`}>calendar_today</span>
                                        Создан: {new Date(course.created_at).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <Link
                                    href={`/admin/dashboard/courses/${course.id}/lessons`}
                                    className={`${styles.actionButton} ${styles.lessons}`}
                                >
                                    <span className={`material-symbols-outlined ${styles.actionIcon}`}>format_list_numbered</span>
                                    Уроки
                                </Link>

                                <Link
                                    href={`/admin/dashboard/courses/${course.id}/edit`}
                                    className={`${styles.actionButton} ${styles.edit}`}
                                >
                                    <span className={`material-symbols-outlined ${styles.actionIcon}`}>edit</span>
                                    Изменить
                                </Link>

                                {userRole === 'admin' && (
                                    <button
                                        onClick={() => confirmDelete(course.id, course.title)}
                                        className={`${styles.actionButton} ${styles.delete}`}
                                    >
                                        <span className={`material-symbols-outlined ${styles.actionIcon}`}>delete</span>
                                        Удалить
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <span className={`material-symbols-outlined ${styles.emptyIcon}`}>search_off</span>
                        <h3 className={styles.emptyTitle}>Курсы не найдены</h3>
                        <p className={styles.emptyText}>В базе данных пока нет курсов, соответствующих вашему запросу.</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('All');
                                window.history.replaceState({}, '', '/admin/dashboard/courses');
                            }}
                            className={styles.resetButton}
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default function AdminCoursesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><span className="material-symbols-outlined animate-spin text-3xl text-blue-600">autorenew</span></div>}>
            <CoursesPageContent />
        </Suspense>
    );
}