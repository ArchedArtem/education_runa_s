"use client";
import Link from 'next/link';
import styles from './Register.module.scss';
import { useRouter } from 'next/navigation';
import {useState} from "react";
export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        companyData: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Что-то пошло не так');
            }

            alert('Регистрация успешна! Теперь вы можете войти.');
            router.push('/login');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <section className={`${styles.leftSide} ${styles.bgMesh}`}>
                <div className="absolute top-[10%] -left-20 w-64 h-64 rounded-full border border-white/10 glass-effect"></div>
                <div className="absolute bottom-[20%] -right-10 w-96 h-96 rounded-full border border-white/10 glass-effect"></div>

                <div className="relative z-10">
                    <Link className="font-bold text-2xl text-white tracking-tighter" href="/">Руна С Обучение</Link>
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
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Регистрация</h2>
                        <p className="text-slate-500 text-sm">Пожалуйста, заполните данные для создания вашей учетной записи</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
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
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Корпоративные данные</label>
                            <div className={styles.inputWrapper}>
                                <span className="material-symbols-outlined absolute left-4 text-slate-400">shield</span>
                                <input
                                    type="text"
                                    name="companyData"
                                    placeholder="ИНН компании или код приглашения"
                                    value={formData.companyData}
                                    onChange={handleChange}
                                    required
                                />
                                <div className={styles.focusLine}></div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Безопасность</label>
                            <div className={styles.inputWrapper}>
                                <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Придумайте пароль"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                                <div className={styles.focusLine}></div>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-slate-500 text-sm">
                                Уже есть аккаунт?
                                <Link href="/login" className="text-blue-600 font-semibold hover:underline ml-1">Войти</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}