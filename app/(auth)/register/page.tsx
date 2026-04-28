"use client";

import Link from 'next/link';
import styles from './register.module.scss';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import useSWR from 'swr';
import { useToast } from '@/app/components/Providers/ToastProvider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RegisterPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const { data: settings, isLoading: isSettingsLoading } = useSWR('/api/settings', fetcher);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        companyData: '',
        inviteCode: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    router.push('/dashboard');
                } else {
                    setIsCheckingAuth(false);
                }
            } catch (err) {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...dataToSend } = formData;

            if (settings && !settings.inviteOnly) {
                delete (dataToSend as any).inviteCode;
            }

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Что-то пошло не так. Проверьте данные.');
            }

            showToast('Регистрация успешна! Теперь вы можете войти.', 'success');
            router.push('/login');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth || isSettingsLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6 font-sans">
                <div className="relative flex items-center justify-center w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-blue-700 animate-spin"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-700/30">
                        <span className="material-symbols-outlined text-4xl">shield</span>
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {settings?.platformName || 'Руна С Обучение'}
                    </h2>
                    <p className="text-sm font-medium text-blue-700 animate-pulse">
                        Подготовка среды...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className={`${styles.main} animate-in fade-in duration-500`}>
            <section className={`${styles.leftSide} ${styles.bgMesh}`}>
                <div className="absolute top-[10%] -left-20 w-64 h-64 rounded-full border border-white/10 glass-effect"></div>
                <div className="absolute bottom-[20%] -right-10 w-96 h-96 rounded-full border border-white/10 glass-effect"></div>

                <div className="relative z-10">
                    <Link className="font-bold text-2xl text-white tracking-tighter" href="/">
                        {settings?.platformName || 'Руна С Обучение'}
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Добро пожаловать
                    </h1>
                    <p className="text-white/70 text-lg lg:text-xl font-light leading-relaxed">
                        Доступ к обучающим материалам только для действующих клиентов
                    </p>
                </div>

                <div className="relative z-10">
                    <div className={`flex items-center gap-3 py-3 px-5 rounded-full ${styles.glassEffect}`}>
                        <span className="material-symbols-outlined text-blue-300">verified_user</span>
                        <span className="text-white/80 text-sm font-medium">Защищенная корпоративная среда </span>
                    </div>
                </div>
            </section>

            <section className={styles.rightSide}>
                <div className="w-full max-w-md">

                    <div className="md:hidden mb-6">
                        <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            <span className="text-sm font-bold">На главную</span>
                        </Link>
                    </div>

                    {settings && !settings.allowRegistration ? (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl text-slate-400">block</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Регистрация закрыта</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                В данный момент самостоятельное создание учетных записей отключено администратором платформы.
                            </p>
                            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all w-full">
                                <span className="material-symbols-outlined">login</span>
                                Войти в существующий аккаунт
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Регистрация</h2>
                                <p className="text-slate-500 text-sm">Пожалуйста, заполните данные для создания вашей учетной записи</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSubmit}>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ФИО</label>
                                    <div className={styles.inputWrapper}>
                                        <span className="material-symbols-outlined absolute left-4 text-slate-400">person</span>
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="Имя и Фамилия"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className={styles.focusLine}></div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Почта</label>
                                    <div className={styles.inputWrapper}>
                                        <span className="material-symbols-outlined absolute left-4 text-slate-400">mail</span>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Рабочий Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className={styles.focusLine}></div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Организация</label>
                                    <div className={styles.inputWrapper}>
                                        <span className="material-symbols-outlined absolute left-4 text-slate-400">domain</span>
                                        <input
                                            type="text"
                                            name="companyData"
                                            placeholder="ООО Ромашка (название полностью)"
                                            value={formData.companyData}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className={styles.focusLine}></div>
                                    </div>
                                </div>

                                {settings?.inviteOnly && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Код доступа</label>
                                        <div className={styles.inputWrapper}>
                                            <span className="material-symbols-outlined absolute left-4 text-slate-400">confirmation_number</span>
                                            <input
                                                type="text"
                                                name="inviteCode"
                                                placeholder="Введите пригласительный код"
                                                value={formData.inviteCode}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className={styles.focusLine}></div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Пароль</label>
                                        <div className={styles.inputWrapper}>
                                            <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="От 6 символов"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                            />
                                            <div className={styles.focusLine}></div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Повторите</label>
                                        <div className={styles.inputWrapper}>
                                            <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Пароль еще раз"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                            />
                                            <div className={styles.focusLine}></div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className={`${styles.submitBtn} mt-2`} disabled={isLoading}>
                                    {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                                </button>

                                <div className="text-center pt-2">
                                    <p className="text-slate-500 text-sm">
                                        Уже есть аккаунт?
                                        <Link href="/login" className="text-blue-700 font-semibold hover:underline ml-1">Войти</Link>
                                    </p>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}