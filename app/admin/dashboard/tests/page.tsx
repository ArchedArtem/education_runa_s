"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './tests.module.scss';

const MOCK_TESTS = [
    {
        id: '201',
        title: 'Итоговый тест: 1С:Бухгалтерия',
        courseName: 'Ведение учета в 1С:Бухгалтерия 8.3',
        softwareProduct: '1С:Бухгалтерия',
        passingScore: 80,
        questionsCount: 25,
        updatedAt: '12.05.2026',
        status: 'Active'
    },
    {
        id: '202',
        title: 'Модуль 2: Учет рабочего времени',
        courseName: 'Кадровый учет в 1С:ЗУП 8',
        softwareProduct: '1С:ЗУП',
        passingScore: 70,
        questionsCount: 15,
        updatedAt: '10.05.2026',
        status: 'Active'
    },
    {
        id: '203',
        title: 'Вводный тест: 1С:УТ',
        courseName: 'Оптовые продажи в 1С:УТ 11',
        softwareProduct: '1С:УТ',
        passingScore: 60,
        questionsCount: 10,
        updatedAt: '05.05.2026',
        status: 'Draft'
    }
];

export default function AdminTestsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('All');

    const filteredTests = MOCK_TESTS.filter(test => {
        const matchesSearch =
            test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.courseName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCourse =
            courseFilter === 'All' || test.softwareProduct === courseFilter;

        return matchesSearch && matchesCourse;
    });

    return (
        <div className="p-8 lg:p-10 space-y-6 max-w-[1600px] mx-auto w-full">

            <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">База тестов</h1>
                    <p className="text-slate-500 font-medium mt-1">Управление тестированиями, вопросами и ответами.</p>
                </div>
                <button className="cursor-pointer px-5 py-2.5 bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-700/20 hover:bg-blue-800 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add_box</span>
                    Создать тест
                </button>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">

                <div className="relative w-full lg:max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Поиск по названию теста или курсу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                    {['All', '1С:Бухгалтерия', '1С:ЗУП', '1С:УТ'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setCourseFilter(filter)}
                            className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                                courseFilter === filter
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {filter === 'All' ? 'Все продукты' : filter}
                        </button>
                    ))}
                </div>
            </section>

            <section className="flex flex-col gap-4">
                {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                        <div key={test.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md hover:border-blue-200 transition-all group">

                            <div className="flex items-start gap-5 flex-1 min-w-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                                    test.status === 'Active' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <span className="material-symbols-outlined text-[24px]">quiz</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                            {test.title}
                                        </h2>
                                        {test.status === 'Draft' && (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded">
                                                Черновик
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-slate-400">menu_book</span>
                                        {test.courseName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 md:px-8 md:border-l md:border-r border-slate-100 shrink-0">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Вопросов</span>
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                                        <span className="font-bold text-lg leading-none">{test.questionsCount}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Проходной балл</span>
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                                        <span className="font-bold text-lg leading-none">{test.passingScore}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/dashboard/tests/${test.id}/questions`}
                                    className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                    Вопросы
                                </Link>
                                <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors" title="Настройки теста">
                                    <span className="material-symbols-outlined text-[20px]">settings</span>
                                </button>
                                <button className="p-2 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors" title="Удалить тест">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Тесты не найдены</h3>
                        <p className="text-slate-500 mb-4">Попробуйте изменить параметры поиска или фильтра.</p>
                        <button
                            onClick={() => {setSearchQuery(''); setCourseFilter('All');}}
                            className="text-blue-700 font-bold hover:underline"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}