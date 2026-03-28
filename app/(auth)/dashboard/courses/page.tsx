"use client";

import Link from 'next/link';
import {useState} from 'react';
import styles from './courses.module.scss';

const MOCK_COURSES = [
    {
        id: 1,
        title: 'Ведение учета в 1С:Бухгалтерия 8.3',
        description: 'Изучение основных механизмов программы, настройка параметров учета, ввод начальных остатков и формирование отчетности.',
        software_product: '1С:Бухгалтерия',
        thumbnail_url: 'bg-gradient-to-br from-blue-600 to-blue-800',
        lessonsCount: 18,
    },
    {
        id: 2,
        title: 'Кадровый учет в 1С:ЗУП 8',
        description: 'Управление персоналом, штатное расписание, учет рабочего времени и полный цикл расчета заработной платы.',
        software_product: '1С:ЗУП',
        thumbnail_url: 'bg-gradient-to-br from-indigo-500 to-purple-700',
        lessonsCount: 10,
    },
    {
        id: 3,
        title: 'Оптовые продажи в 1С:УТ 11',
        description: 'Оформление оптовых и розничных продаж, управление складом, закупками и взаиморасчетами с контрагентами.',
        software_product: '1С:УТ',
        thumbnail_url: 'bg-gradient-to-br from-cyan-600 to-blue-700',
        lessonsCount: 24,
    },
    {
        id: 4,
        title: 'Налоговый учет и отчетность',
        description: 'Продвинутый курс по закрытию месяца, расчету налогов (НДС, Налог на прибыль) и формированию регламентированной отчетности.',
        software_product: '1С:Бухгалтерия',
        thumbnail_url: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        lessonsCount: 15,
    }
];

const FILTERS = ['Все продукты', '1С:Бухгалтерия', '1С:ЗУП', '1С:УТ'];

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Все продукты');

    const filteredCourses = MOCK_COURSES.filter(course => {
        const matchesFilter = activeFilter === 'Все продукты' || course.software_product === activeFilter;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="p-10 space-y-8 max-w-[1600px] mx-auto w-full">

            <section className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Каталог курсов</h1>
                <p className="text-lg text-slate-500 font-medium">Обучающие программы по продуктам 1С для
                    сотрудников.</p>
            </section>

            <section
                className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative w-full xl:max-w-md">
                    <span
                        className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeFilter === filter
                                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <div key={course.id}
                             className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group flex flex-col hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">

                            <div className={`h-48 w-full relative ${course.thumbnail_url}`}>
                                <div
                                    className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>

                                <div
                                    className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm border border-white/20 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                                                {course.software_product}
                                            </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
                                    {course.description}
                                </p>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span className="material-symbols-outlined text-[20px]">play_lesson</span>
                                        <span className="text-sm font-semibold">{course.lessonsCount} уроков</span>
                                    </div>
                                </div>

                                <Link href={`/dashboard/courses/${course.id}`}
                                      className="w-full py-2.5 rounded-lg border-2 border-blue-700 text-blue-700 font-bold text-sm text-center hover:bg-blue-700 hover:text-white transition-colors">
                                    Подробнее
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Курсы не найдены</h3>
                        <p className="text-slate-500">Попробуйте изменить параметры поиска или фильтра.</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveFilter('Все продукты');
                            }}
                            className="mt-6 text-blue-700 font-semibold hover:underline"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}