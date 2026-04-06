"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.scss';

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ошибка при входе');
            }

            router.push('/dashboard');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
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
                        Руна С Обучение
                    </h2>
                    <p className="text-sm font-medium text-blue-700 animate-pulse">
                        Проверка сессии...
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
                    <Link className="font-bold text-2xl text-white tracking-tighter" href="/">Руна С Обучение</Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight whitespace-nowrap">
                        С возвращением!
                    </h1>
                    <p className="text-white/70 text-lg lg:text-xl font-light leading-relaxed">
                        Доступ к обучающим материалам только для действующих клиентов
                    </p>
                </div>

                <div className="relative z-10">
                    <div className={`flex items-center gap-3 py-3 px-5 rounded-full ${styles.glassEffect}`}>
                        <span className="material-symbols-outlined text-blue-300">verified_user</span>
                        <span className="text-white/80 text-sm font-medium">Защищенная корпоративная среда</span>
                    </div>
                </div>
            </section>

            <section className={styles.rightSide}>
                <div className="w-full max-w-md">

                    <div className="md:hidden mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            <span className="text-sm font-bold">На главную</span>
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Вход</h2>
                        <p className="text-slate-500 text-sm">Авторизуйтесь для продолжения обучения</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Почта</label>
                            <div className={styles.inputWrapper}>
                                <span className="material-symbols-outlined absolute left-4 text-slate-400">mail</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Ваш Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <div className={styles.focusLine}></div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Пароль</label>
                            <div className={styles.inputWrapper}>
                                <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Введите пароль"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <div className={styles.focusLine}></div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                {isLoading ? 'Вход...' : 'Войти в аккаунт'}
                            </button>
                            <Link href="/forgot-password" className={styles.forgotPass}>
                                Восстановить пароль
                            </Link>
                        </div>

                        <div className="text-center pt-4 border-t border-slate-100">
                            <p className="text-slate-500 text-sm">
                                Нет аккаунта?
                                <Link href="/register" className="text-blue-600 font-semibold hover:underline ml-1">Зарегистрироваться</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}