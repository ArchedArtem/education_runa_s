"use client";

import Link from 'next/link';
import { useState } from 'react';
import styles from './Forgot-password.module.scss';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ошибка при отправке запроса');
            }

            setSuccessMessage('Ссылка для сброса пароля отправлена на ваш email. Пожалуйста, проверьте папку "Входящие" и "Спам".');
            setEmail('');

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
                        Восстановление<br />доступа
                    </h1>
                    <p className="text-white/70 text-lg lg:text-xl font-light leading-relaxed">
                        Поможем быстро вернуться к вашим учебным материалам и курсам 1С
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
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Забыли пароль?</h2>
                        <p className="text-slate-500 text-sm">
                            Введите email, привязанный к вашему аккаунту. Мы отправим инструкции по сбросу.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {successMessage ? (
                        <div className="mb-6 p-6 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200 text-center">
                            <span className="material-symbols-outlined text-green-500 text-4xl mb-2 block">mark_email_read</span>
                            <p className="font-medium text-base mb-4">{successMessage}</p>
                            <Link href="/login" className={styles.submitBtn} style={{ display: 'inline-block', textDecoration: 'none' }}>
                                Вернуться ко входу
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Почта
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className="material-symbols-outlined absolute left-4 text-slate-400">mail</span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Ваш Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className={styles.focusLine}></div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className={styles.submitBtn}>
                                    Отправить инструкцию
                                </button>
                            </div>

                            <div className="text-center pt-6 border-t border-slate-100">
                                <Link href="/login" className="text-slate-500 text-sm font-semibold hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    Вернуться ко входу
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}