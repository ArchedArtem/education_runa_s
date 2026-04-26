"use client";

import { useEffect, useState } from 'react';
import styles from './ToastAlert.module.scss';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface ToastAlertProps {
    message: string;
    type: AlertType;
    isOpen: boolean;
    onClose: () => void;
    duration?: number;
}

export default function ToastAlert({
                                       message,
                                       type,
                                       isOpen,
                                       onClose,
                                       duration = 4000
                                   }: ToastAlertProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen && !isVisible) return null;

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    return (
        <div className={`${styles.toastWrapper} ${isVisible ? styles.show : styles.hide}`}>
            <div className={`${styles.toast} ${styles[type]}`}>
                <span className={`material-symbols-outlined ${styles.icon}`}>
                    {icons[type]}
                </span>
                <p className={styles.message}>{message}</p>
                <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className={styles.closeBtn}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
}