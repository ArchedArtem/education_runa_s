"use client";

import { useEffect } from 'react';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDangerous?: boolean;
}

export default function ConfirmModal({
                                         isOpen,
                                         title,
                                         message,
                                         confirmText = 'Подтвердить',
                                         cancelText = 'Отмена',
                                         onConfirm,
                                         onCancel,
                                         isDangerous = false
                                     }: ConfirmModalProps) {
    // Блокируем скролл страницы, когда модалка открыта
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.backdrop} onClick={onCancel} />
            <div className={styles.modalCard}>
                <div className={styles.iconWrapper} data-dangerous={isDangerous}>
                    <span className="material-symbols-outlined">
                        {isDangerous ? 'warning' : 'help_outline'}
                    </span>
                </div>

                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={isDangerous ? styles.dangerBtn : styles.primaryBtn}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}