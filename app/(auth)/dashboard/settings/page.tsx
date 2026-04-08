"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import styles from './settings.module.scss';

export default function SettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [personalInfo, setPersonalInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        companyName: '',
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setPersonalInfo({
                            firstName: data.user.first_name || '',
                            lastName: data.user.last_name || '',
                            email: data.user.email || '',
                            companyName: data.user.company_name || 'Не указана',
                        });
                    }
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [router]);

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (passwords.new && passwords.new !== passwords.confirm) {
            alert('Новые пароли не совпадают!');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: personalInfo.firstName,
                    last_name: personalInfo.lastName,
                    email: personalInfo.email,
                    current_password: passwords.current,
                    new_password: passwords.new,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Изменения успешно сохранены!');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                alert(data.error || 'Ошибка при сохранении');
            }
        } catch (error) {
            alert('Сбой соединения с сервером');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loaderHeader}>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonSubtitle}></div>
                </div>

                <div className={styles.formGrid}>
                    {[1, 2].map((i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonCardHeader}></div>
                            <div className={styles.skeletonForm}>
                                <div className={styles.skeletonRow}>
                                    <div className={styles.skeletonInput}></div>
                                    <div className={styles.skeletonInput}></div>
                                </div>
                                <div className={styles.skeletonInputFull}></div>
                                <div className={styles.skeletonInputFull}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <section className={styles.pageHeader}>
                <h1 className={styles.title}>Настройки профиля</h1>
                <p className={styles.subtitle}>Управление личными данными и безопасностью аккаунта.</p>
            </section>

            <section className={styles.formGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className="material-symbols-outlined">badge</span>
                        <h2 className={styles.cardTitle}>Личная информация</h2>
                    </div>

                    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                        <div className={styles.inputRow}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Имя</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={personalInfo.firstName}
                                    onChange={handlePersonalInfoChange}
                                    className={styles.inputField}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Фамилия</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={personalInfo.lastName}
                                    onChange={handlePersonalInfoChange}
                                    className={styles.inputField}
                                />
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Рабочий Email</label>
                            <input
                                type="email"
                                name="email"
                                value={personalInfo.email}
                                onChange={handlePersonalInfoChange}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                Организация
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                            </label>
                            <div className={styles.relativeWrapper}>
                                <span className={`material-symbols-outlined ${styles.inputIconLeft}`}>domain</span>
                                <input
                                    type="text"
                                    value={personalInfo.companyName}
                                    disabled
                                    className={styles.inputDisabled}
                                />
                                <span className={`material-symbols-outlined ${styles.inputIconRight}`}>lock</span>
                            </div>
                            <p className={styles.hintText}>Для изменения организации обратитесь в службу поддержки.</p>
                        </div>
                    </form>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className="material-symbols-outlined">shield_lock</span>
                        <h2 className={styles.cardTitle}>Безопасность</h2>
                    </div>

                    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Текущий пароль</label>
                            <input
                                type="password"
                                name="current"
                                placeholder="••••••••••••"
                                value={passwords.current}
                                onChange={handlePasswordChange}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Новый пароль</label>
                            <input
                                type="password"
                                name="new"
                                placeholder="Минимум 8 символов"
                                value={passwords.new}
                                onChange={handlePasswordChange}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Повторите новый пароль</label>
                            <input
                                type="password"
                                name="confirm"
                                placeholder="Подтвердите пароль"
                                value={passwords.confirm}
                                onChange={handlePasswordChange}
                                className={styles.inputField}
                            />
                        </div>
                    </form>
                </div>
            </section>

            <section className={styles.footerActions}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className={styles.btnCancel}
                >
                    Отмена
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={styles.btnSave}
                >
                    <span className="material-symbols-outlined">
                        {isSaving ? 'autorenew' : 'save'}
                    </span>
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </section>
        </div>
    );
}