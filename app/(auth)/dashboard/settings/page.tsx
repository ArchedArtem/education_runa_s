"use client";

import { useEffect, useState } from 'react';
import styles from './settings.module.scss';
import { useRouter } from "next/navigation";

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
                console.error("Ошибка загрузки профиля", error);
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
            <div className="p-10 space-y-8 max-w-[1600px] mx-auto w-full animate-pulse">
                <div className="space-y-3">
                    <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
                    <div className="h-5 w-96 bg-slate-100 rounded-md"></div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 flex flex-col space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                <div className="w-7 h-7 bg-slate-200 rounded-md"></div>
                                <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <div className="h-3 w-12 bg-slate-200 rounded"></div>
                                        <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                        <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                    <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 space-y-8 max-w-[1600px] mx-auto w-full">

            <section className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Настройки профиля</h1>
                <p className="text-lg text-slate-500 font-medium">Управление личными данными и безопасностью аккаунта.</p>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col ${styles.glassCard}`}>
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <span className="material-symbols-outlined text-blue-700">badge</span>
                        <h2 className="text-xl font-bold text-slate-900">Личная информация</h2>
                    </div>

                    <form className="space-y-5 flex-1" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Имя</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={personalInfo.firstName}
                                    onChange={handlePersonalInfoChange}
                                    className={styles.inputField}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Фамилия</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={personalInfo.lastName}
                                    onChange={handlePersonalInfoChange}
                                    className={styles.inputField}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Рабочий Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={personalInfo.email}
                                    onChange={handlePersonalInfoChange}
                                    className={`${styles.inputField} pl-10`}
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                Организация
                                <span className="material-symbols-outlined text-[14px] text-slate-400">info</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">domain</span>
                                <input
                                    type="text"
                                    value={personalInfo.companyName}
                                    disabled
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed text-sm font-medium"
                                />
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Для изменения организации обратитесь в службу поддержки.</p>
                        </div>
                    </form>
                </div>

                <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col ${styles.glassCard}`}>
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <span className="material-symbols-outlined text-blue-700">shield_lock</span>
                        <h2 className="text-xl font-bold text-slate-900">Безопасность</h2>
                    </div>

                    <form className="space-y-5 flex-1" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Текущий пароль</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="current"
                                    placeholder="••••••••••••"
                                    value={passwords.current}
                                    onChange={handlePasswordChange}
                                    className={`${styles.inputField} pl-10`}
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Новый пароль</label>
                            <input
                                type="password"
                                name="new"
                                placeholder="Минимум 8 символов"
                                value={passwords.new}
                                onChange={handlePasswordChange}
                                className={styles.inputField}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Повторите новый пароль</label>
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

            <section className="pt-6 border-t border-slate-200 flex justify-end gap-4 mt-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="cursor-pointer px-6 py-2.5 rounded-lg font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-all text-sm"
                >
                    Отмена
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="cursor-pointer px-6 py-2.5 rounded-lg font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 transition-all active:scale-95 text-sm flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {isSaving ? 'autorenew' : 'save'}
                    </span>
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </section>
        </div>
    );
}