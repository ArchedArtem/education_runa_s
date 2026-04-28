"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastAlert, { AlertType } from '../UI/ToastAlert/ToastAlert';
import styles from '../UI/ToastAlert/ToastAlert.module.scss';

type ToastItem = {
    id: number;
    message: string;
    type: AlertType;
    duration: number;
};

interface ToastContextType {
    showToast: (message: string, type?: AlertType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: AlertType = 'info', duration: number = 4500) => {
        setToasts(prev => {
            const newToast = { id: Date.now() + Math.random(), message, type, duration };
            const newToasts = [...prev, newToast];
            return newToasts.slice(-3);
        });
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <ToastAlert
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast должен использоваться внутри ToastProvider');
    return context;
};