"use client";

import styles from './page.module.scss';

const RECENT_CLIENTS = [
    { id: 1, name: 'ООО Альфа-Трейд', email: 'admin@alfa.ru', date: 'Сегодня', status: 'Активен' },
    { id: 2, name: 'ИП Смирнов', email: 'info@smirnov.ru', date: 'Вчера', status: 'Активен' },
    { id: 3, name: 'ЗАО Вектор', email: 'hello@vector.com', date: '12 мая', status: 'Ожидает' },
    { id: 4, name: 'ООО ТехПром', email: 'contact@techprom.ru', date: '10 мая', status: 'Активен' },
];

export default function AdminDashboardPage() {
    return (
        <div className="p-8 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full">

            <section className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Сводная статистика</h1>
                <p className="text-slate-500 font-medium">Показатели платформы и активность клиентов.</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">group</span>
                        </div>
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            +12 за месяц
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Всего клиентов</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">142</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">menu_book</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Активные курсы</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">8</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Средний балл тестов</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">86</h3>
                            <span className="text-sm font-bold text-slate-400">/100</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">task_alt</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Завершаемость курсов</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">64%</h3>
                    </div>
                </div>

            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Активность обучения</h2>
                            <p className="text-xs text-slate-500 font-medium">Пройденные уроки за последние 7 дней</p>
                        </div>
                        <button className="text-sm font-semibold text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            Подробный отчет
                        </button>
                    </div>

                    <div className={`flex-1 min-h-[300px] w-full rounded-lg border border-slate-100 relative ${styles.chartPattern} flex items-end p-4 gap-2`}>
                        <div className="w-full bg-blue-100/50 rounded-t-sm h-[30%] hover:bg-blue-200 transition-colors relative group">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">12</span>
                        </div>
                        <div className="w-full bg-blue-200/50 rounded-t-sm h-[45%] hover:bg-blue-300 transition-colors relative group">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">28</span>
                        </div>
                        <div className="w-full bg-blue-400/50 rounded-t-sm h-[80%] hover:bg-blue-500 transition-colors relative group">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">64</span>
                        </div>
                        <div className="w-full bg-blue-300/50 rounded-t-sm h-[60%] hover:bg-blue-400 transition-colors relative group">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">42</span>
                        </div>
                        <div className="w-full bg-blue-700 rounded-t-sm h-[95%] shadow-[0_0_15px_rgba(29,78,216,0.3)] relative group">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">89</span>
                        </div>
                        <div className="w-full bg-blue-200/50 rounded-t-sm h-[50%] hover:bg-blue-300 transition-colors relative group">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">35</span>
                        </div>
                        <div className="w-full bg-blue-100/50 rounded-t-sm h-[40%] hover:bg-blue-200 transition-colors relative group">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">22</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Новые клиенты</h2>
                        <span className="material-symbols-outlined text-slate-400 text-[20px] cursor-pointer hover:text-blue-700 transition-colors">more_horiz</span>
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                        {RECENT_CLIENTS.map(client => (
                            <div key={client.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                                    {client.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">{client.name}</h3>
                                    <p className="text-xs text-slate-500 truncate">{client.email}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-semibold text-slate-900 mb-0.5">{client.date}</p>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        client.status === 'Активен' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {client.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                        Смотреть всех пользователей
                    </button>
                </div>

            </section>
        </div>
    );
}