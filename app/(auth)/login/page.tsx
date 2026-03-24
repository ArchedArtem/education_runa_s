import Link from 'next/link';
import styles from './Login.module.scss';

export default function LoginPage() {
    return (
        <main className={styles.main}>
            {/* LEFT SIDE: Branding & Value */}
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

            {/* RIGHT SIDE: The Login Form */}
            <section className={styles.rightSide}>
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Вход</h2>
                        <p className="text-slate-500 text-sm">Авторизуйтесь для продолжения обучения</p>
                    </div>

                    <form className="space-y-6">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Почта</label>
                            <div className={styles.inputWrapper}>
                                <span className="material-symbols-outlined absolute left-4 text-slate-400">mail</span>
                                <input type="email" placeholder="Ваш Email" required />
                                <div className={styles.focusLine}></div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Пароль</label>
                            <div className={styles.inputWrapper}>
                                <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                                <input type="password" placeholder="Введите пароль" required />
                                <div className={styles.focusLine}></div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" className={styles.submitBtn}>
                                Войти в аккаунт
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