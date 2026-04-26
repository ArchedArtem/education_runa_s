"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastAlert, { AlertType } from '../UI/ToastAlert/ToastAlert';

interface ToastContextType {
    showToast: (message: string, type?: AlertType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        message: string;
        type: AlertType;
        duration: number;
    }>({
        isOpen: false,
        message: '',
        type: 'info',
        duration: 4500
    });

    const showToast = useCallback((message: string, type: AlertType = 'info', duration: number = 6000) => {
        setAlertConfig({ isOpen: true, message, type, duration });
    }, []);

    const closeToast = useCallback(() => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastAlert
                isOpen={alertConfig.isOpen}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={closeToast}
                duration={alertConfig.duration}
            />
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast должен использоваться внутри ToastProvider');
    return context;
};