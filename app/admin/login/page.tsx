"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.scss';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/admin/auth/me');
                if (res.ok) {
                    router.push('/admin/dashboard');
                } else {
                    setIsCheckingAuth(false);
                }
            } catch (err) {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Неверные учетные данные или недостаточно прав');
            }

            router.push('/admin/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg">
                        <span className="material-symbols-outlined text-4xl text-blue-500">shield</span>
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Руна С • CMS
                    </h2>
                    <p className="text-sm font-medium text-slate-400 animate-pulse">
                        Проверка прав доступа...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className={`min-h-screen flex items-center justify-center p-4 ${styles.adminBg} font-sans animate-in fade-in duration-300`}>

            <div className="w-full max-w-md flex flex-col items-center">

                <div className="flex items-center justify-center gap-2 mb-8 opacity-80">
                    <span className="material-symbols-outlined text-white text-[20px]">shield</span>
                    <span className="text-white font-bold tracking-wide">Руна С Обучение</span>
                    <span className="text-slate-500 text-sm">•</span>
                    <span className="text-slate-400 text-sm font-medium tracking-wide">Административный доступ</span>
                </div>

                <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

                    <div className="px-10 pt-10 pb-8 border-b border-slate-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-5 shadow-md">
                            <span className="material-symbols-outlined text-white text-[24px]">shield_lock</span>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                            Панель управления
                        </h1>
                        <p className="text-sm text-slate-500 mb-5">
                            Авторизация для сотрудников и методистов
                        </p>

                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Служебный доступ
                        </div>
                    </div>

                    <div className="px-10 py-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-start gap-2">
                                <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Рабочий Email</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                                    <input
                                        type="email"
                                        placeholder="admin@runa-s.ru"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={styles.inputField}
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Пароль</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">key</span>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={styles.inputField}
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="cursor-pointer w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isLoading ? (
                                        <span className="material-symbols-outlined animate-spin">autorenew</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[20px]">login</span>
                                    )}
                                    <span>Войти в систему</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-center">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">policy</span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Доступ контролируется. Действия логируются.
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}