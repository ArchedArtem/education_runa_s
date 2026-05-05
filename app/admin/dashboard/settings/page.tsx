"use client";

import { useState, useEffect } from 'react';
import styles from './settings.module.scss';
import { useToast } from '@/app/components/Providers/ToastProvider';

export default function AdminSettingsPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        platformName: '',
        supportEmail: '',
        supportPhone: '',
        address: '',
        workingHours: '',
        allowRegistration: true,
        inviteOnly: false,
    });

        useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        platformName: data.platformName || '',
                        supportEmail: data.supportEmail || '',
                        supportPhone: data.supportPhone || '',
                        address: data.address || '',
                        workingHours: data.workingHours || '',
                        allowRegistration: data.allowRegistration ?? true,
                        inviteOnly: data.inviteOnly ?? false,
                    });
                }
            } catch (error) {
                showToast('Ошибка при загрузке настроек', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [showToast]);

    const handleToggle = (field: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Ошибка сохранения');

            showToast('Настройки платформы успешно сохранены', 'success');
        } catch (error) {
            showToast('Ошибка при сохранении настроек', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={`${styles.pageContainer} flex items-center justify-center min-h-[50vh]`}>
                <div className="flex flex-col items-center text-slate-400 gap-3">
                    <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
                    <p className="font-medium">Загрузка настроек...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <section className={styles.headerSection}>
                <div className={styles.titleGroup}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.mainTitle}>Настройки сайта</h1>
                    </div>
                    <p className={styles.subtitle}>Глобальные параметры работы обучающей платформы.</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={handleSave} disabled={isSaving} className={styles.btnPrimary}>
                        <span className={`material-symbols-outlined ${isSaving ? styles.spinIcon : ''}`}>
                            {isSaving ? 'autorenew' : 'save'}
                        </span>
                        {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
                    </button>
                </div>
            </section>

            <div className={styles.contentGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={`material-symbols-outlined ${styles.headerIcon}`}>domain</span>
                        <h2 className={styles.cardTitle}>Основные параметры</h2>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Название платформы</label>
                        <input
                            type="text"
                            name="platformName"
                            value={settings.platformName}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email поддержки</label>
                            <input
                                type="email"
                                name="supportEmail"
                                value={settings.supportEmail}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Телефон поддержки</label>
                            <input
                                type="text"
                                name="supportPhone"
                                value={settings.supportPhone}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Адрес</label>
                            <input
                                type="text"
                                name="address"
                                value={settings.address}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Время работы</label>
                            <input
                                type="text"
                                name="workingHours"
                                value={settings.workingHours}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={`material-symbols-outlined ${styles.headerIcon}`}>how_to_reg</span>
                        <h2 className={styles.cardTitle}>Регистрация и Доступ</h2>
                    </div>

                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h3>Разрешить регистрацию на платформе</h3>
                            <p>Позволяет пользователям самостоятельно создавать аккаунты.</p>
                        </div>
                        <label className={styles.switchWrapper}>
                            <div className={`${styles.switchTrack} ${settings.allowRegistration ? styles.switchOn : ''}`}>
                                <div className={styles.switchThumb}></div>
                            </div>
                            <input type="checkbox" className={styles.hiddenInput} checked={settings.allowRegistration} onChange={() => handleToggle('allowRegistration')} />
                        </label>
                    </div>

                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <h3>Регистрация только по пригласительному коду</h3>
                            <p>Доступ к платформе только по специальному коду от администратора.</p>
                        </div>
                        <label className={styles.switchWrapper}>
                            <div className={`${styles.switchTrack} ${settings.inviteOnly ? styles.switchOn : ''}`}>
                                <div className={styles.switchThumb}></div>
                            </div>
                            <input type="checkbox" className={styles.hiddenInput} checked={settings.inviteOnly} onChange={() => handleToggle('inviteOnly')} />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}