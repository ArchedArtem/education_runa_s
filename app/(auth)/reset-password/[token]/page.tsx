"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../forgot-password/Forgot-password.module.scss';

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ошибка при сохранении пароля');
            }

            setSuccessMessage('Ваш пароль успешно изменен! Сейчас вы будете перенаправлены на страницу входа.');

            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <main className={styles.main}>
            <section className={`${styles.leftSide} ${styles.bgMesh}`}>
                <div className="absolute top-[10%] -left-20 w-64 h-64 rounded-full border border-white/10 glass-effect"></div>
                <div className="absolute bottom-[20%] -right-10 w-96 h-96 rounded-full border border-white/10 glass-effect"></div>

                <div className="relative z-10">
                    <Link className="font-bold text-2xl text-white tracking-tighter" href="/">
                        Руна С Обучение
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight whitespace-nowrap">
                        Новый<br />пароль
                    </h1>
                    <p className="text-white/70 text-lg lg:text-xl font-light leading-relaxed">
                        Придумайте надежный пароль для защиты вашего аккаунта
                    </p>
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
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Сброс пароля</h2>
                        <p className="text-slate-500 text-sm">
                            Введите новый пароль и подтвердите его ниже.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {successMessage ? (
                        <div className="mb-6 p-6 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200 text-center">
                            <span className="material-symbols-outlined text-green-500 text-4xl mb-2 block">check_circle</span>
                            <p className="font-medium text-base mb-4">{successMessage}</p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Новый пароль */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Новый пароль
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                                    <input
                                        type="password"
                                        placeholder="Минимум 6 символов"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className={styles.focusLine}></div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Повторите пароль
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className="material-symbols-outlined absolute left-4 text-slate-400">lock_reset</span>
                                    <input
                                        type="password"
                                        placeholder="Введите пароль еще раз"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <div className={styles.focusLine}></div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className={styles.submitBtn}>
                                    Сохранить пароль
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}