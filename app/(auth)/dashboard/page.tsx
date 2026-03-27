"use client";

import styles from './page.module.scss';
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    setIsAuth(true);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    if (!isAuth) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            {/* Сюда можно вставить красивый лоадер, если нужно */}
        </div>;
    }

    return (
        <div className={`flex min-h-screen overflow-hidden ${styles.dashboardBg} font-sans text-slate-900`}>
            <aside className="fixed h-screen w-64 left-0 border-r border-slate-200 bg-white flex flex-col py-8 z-50">
                <div className="px-6 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-2xl">school</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-blue-700 leading-none">
                                Руна С
                            </h2>
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                Обучение
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 font-semibold border-r-4 border-blue-700 bg-blue-50 transition-all duration-200">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm">Дашборд</span>
                    </Link>
                    <Link href="/dashboard/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                        <span className="material-symbols-outlined">auto_stories</span>
                        <span className="text-sm">Каталог курсов</span>
                    </Link>
                    <Link href="/dashboard/tests" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                        <span className="material-symbols-outlined">quiz</span>
                        <span className="text-sm">Тестирования</span>
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm">Настройки</span>
                    </Link>
                </nav>

                <div className="px-4 mt-auto">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Организация</p>
                        <p className="text-sm font-bold text-slate-900 truncate">ООО Альфа-Трейд</p>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm">Выйти</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <header className="h-20 bg-white/80 backdrop-blur-md flex justify-between items-center w-full px-8 border-b border-slate-200 sticky top-0 z-40">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-700">search</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-700/20 focus:bg-white transition-all duration-300"
                                placeholder="Поиск по курсам и материалам..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-sm font-semibold text-blue-700">Иванов Иван</span>
                            <span className="text-xs text-slate-500 font-medium">Менеджер по закупкам</span>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center ring-2 ring-slate-100 group-hover:ring-blue-700 transition-all overflow-hidden">
                                <span className="material-symbols-outlined text-slate-500">person</span>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                    </div>
                </header>

                <div className="p-10 space-y-10 max-w-[1600px] mx-auto w-full">

                    <section className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">С возвращением, Иван!</h1>
                        <p className="text-lg text-slate-500 font-medium">Ваш прогресс обучения и результаты на сегодня.</p>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <div className={`lg:col-span-2 ${styles.glassCard} rounded-xl p-8 flex flex-col justify-between shadow-xl shadow-blue-900/5 relative overflow-hidden group border border-white/60`}>
                            <div className="absolute top-0 right-0 p-8">
                                <span className="material-symbols-outlined text-6xl text-blue-700/10 transition-transform duration-500 group-hover:scale-110">account_balance</span>
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="space-y-1">
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase tracking-wider">1С:Бухгалтерия</span>
                                    <h3 className="text-2xl font-bold mt-2 text-slate-900">1С:Бухгалтерия предприятия 8.3</h3>
                                    <p className="text-slate-500 text-sm">Основы ведения учета, налогообложение и отчетность для малого бизнеса.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-semibold text-slate-600">Прогресс обучения</span>
                                        <span className="text-2xl font-bold text-blue-700">65%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[65%] rounded-full shadow-[0_0_12px_rgba(29,78,216,0.4)]"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
                                        <span>Пройдено 12 из 18 уроков</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 relative z-10">
                                <button className="px-8 py-3 bg-gradient-to-br from-blue-700 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2">
                                    <span>Продолжить</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 flex flex-col justify-between shadow-lg shadow-slate-200/50 border border-slate-100 group">
                            <div className="space-y-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">1С:ЗУП 8 Корпоративная</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">Управление персоналом и расчет заработной платы.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Прогресс</span>
                                        <span>20%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-700/40 w-[20%] rounded-full"></div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500">Пройдено 2 из 10 уроков</p>
                                </div>
                            </div>
                            <button className="mt-8 w-full py-3 border-2 border-slate-100 text-blue-700 font-bold rounded-lg hover:bg-slate-50 hover:border-blue-200 transition-all text-sm">
                                Продолжить курс
                            </button>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                                    <span className="material-symbols-outlined text-green-500">verified</span>
                                    Завершенные курсы
                                </h3>
                                <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">Всего: 1</span>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined text-blue-700">shopping_cart</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">1С:Управление торговлей</p>
                                            <p className="text-xs text-slate-500">Завершено 14 мая 2026</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-[10px] text-white font-bold">100</div>
                                        <span className="material-symbols-outlined text-green-500 font-bold">check</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-6 pt-0">
                                <Link href="/certificates" className="text-sm font-bold text-blue-700 hover:underline flex items-center gap-1 w-max">
                                    Посмотреть сертификаты
                                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                                    <span className="material-symbols-outlined text-blue-700">history</span>
                                    История тестирования
                                </h3>
                                <Link href="/tests/history" className="text-xs font-bold text-slate-400 hover:text-blue-700 transition-colors">
                                    СМОТРЕТЬ ВСЕ
                                </Link>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Итоговый тест</span>
                                            <span className="text-xs font-bold text-blue-700">Отлично</span>
                                        </div>
                                        <p className="font-bold text-slate-900">1С:Бухгалтерия (Модуль 1-4)</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">Сертифицирован</span>
                                                <span className="text-xs text-slate-400">12 Июня</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xl font-black text-slate-900 tracking-tighter">95</span>
                                                <span className="text-xs font-bold text-slate-400">/100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="mt-auto py-8 px-10 flex justify-between items-center text-slate-400 border-t border-slate-200 bg-slate-50/50">
                    <p className="text-xs font-medium">© 2026 Руна С Обучение. Все права защищены.</p>
                    <div className="flex gap-6">
                        <Link href="/support" className="text-xs font-medium hover:text-blue-700 transition-colors">Поддержка</Link>
                        <Link href="/privacy" className="text-xs font-medium hover:text-blue-700 transition-colors">Политика конфиденциальности</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}