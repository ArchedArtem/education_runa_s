"use client";

import { useState, useEffect, Suspense } from 'react';
import styles from './comments.module.scss';
import ConfirmModal from '@/app/components/UI/ConfirmModal/ConfirmModal';
import { useToast } from '@/app/components/Providers/ToastProvider';

type CommentType = {
    id: number;
    text: string;
    created_at: string;
    course_id: number;
    user_id: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    course: {
        title: string;
    };
};

function CommentsPageContent() {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch('/api/admin/comments', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (error) {
                showToast('Ошибка при загрузке комментариев', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [showToast]);

    const filteredComments = comments.filter(c => {
        const query = searchQuery.toLowerCase();
        return (
            c.text.toLowerCase().includes(query) ||
            c.user.first_name.toLowerCase().includes(query) ||
            c.user.last_name.toLowerCase().includes(query) ||
            c.course.title.toLowerCase().includes(query)
        );
    });

    const confirmDelete = (id: number) => {
        setCommentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (commentToDelete === null) return;

        const previousComments = [...comments];
        setComments(prev => prev.filter(c => c.id !== commentToDelete));

        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`/api/admin/comments?id=${commentToDelete}`, {
                method: 'DELETE',
                headers
            });

            if (!res.ok) throw new Error();
            showToast('Комментарий успешно удален', 'success');
        } catch (error) {
            setComments(previousComments);
            showToast('Не удалось удалить комментарий', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setCommentToDelete(null);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Удаление комментария"
                message="Вы уверены, что хотите удалить этот комментарий? Это действие необратимо."
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={executeDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                isDangerous={true}
            />

            <section className={styles.headerSection}>
                <div>
                    <h1 className={styles.title}>Отзывы и комментарии</h1>
                    <p className={styles.subtitle}>Глобальное управление комментариями ко всем курсам.</p>
                </div>
            </section>

            <div className={styles.animateFadeIn}>
                <div className={styles.toolbar}>
                    <div className={styles.searchWrapper}>
                        <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                        <input
                            type="text"
                            placeholder="Поиск по тексту, автору или курсу..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.card}>
                    {isLoading ? (
                        <div className={styles.emptyState}>
                            <span className="material-symbols-outlined animate-spin text-3xl">autorenew</span>
                        </div>
                    ) : filteredComments.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}>forum</span>
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>Комментариев не найдено</p>
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.th} style={{ width: '4rem' }}>ID</th>
                                    <th className={styles.th} style={{ width: '20%' }}>Пользователь</th>
                                    <th className={styles.th} style={{ width: '40%' }}>Комментарий</th>
                                    <th className={styles.th}>Курс</th>
                                    <th className={styles.th}>Дата</th>
                                    <th className={styles.th} style={{ textAlign: 'right' }}>Действия</th>
                                </tr>
                                </thead>
                                <tbody className={styles.tbody}>
                                {filteredComments.map((comment) => (
                                    <tr key={comment.id} className={styles.tr}>
                                        <td className={styles.td} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>
                                            #{comment.id}
                                        </td>
                                        <td className={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className={styles.avatar}>
                                                    {comment.user.first_name[0]}{comment.user.last_name[0]}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                                                            {comment.user.first_name} {comment.user.last_name}
                                                        </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            {comment.user.email}
                                                        </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.875rem',
                                                color: '#334155',
                                                whiteSpace: 'normal',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {comment.text}
                                            </p>
                                        </td>
                                        <td className={styles.td}>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: '#1d4ed8',
                                                    backgroundColor: '#eff6ff',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.375rem'
                                                }}>
                                                    {comment.course.title}
                                                </span>
                                        </td>
                                        <td className={styles.td} style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className={styles.td} style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => confirmDelete(comment.id)}
                                                    className={styles.actionBtnDanger}
                                                    title="Удалить комментарий"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminCommentsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><span className="material-symbols-outlined animate-spin text-3xl text-blue-600">autorenew</span></div>}>
            <CommentsPageContent />
        </Suspense>
    );
}