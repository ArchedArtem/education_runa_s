"use client";

import { useEffect, useState } from 'react';
import styles from './ToastAlert.module.scss';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface ToastAlertProps {
    id: number;
    message: string;
    type: AlertType;
    onClose: () => void;
    duration: number;
}

export default function ToastAlert({
                                       id,
                                       message,
                                       type,
                                       onClose,
                                       duration
                                   }: ToastAlertProps) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    return (
        <div className={`${styles.toast} ${styles[type]} ${isClosing ? styles.hide : styles.show}`}>
            <span className={`material-symbols-outlined ${styles.icon}`}>
                {icons[type]}
            </span>
            <p className={styles.message}>{message}</p>
            <button onClick={handleClose} className={styles.closeBtn}>
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
    );
}