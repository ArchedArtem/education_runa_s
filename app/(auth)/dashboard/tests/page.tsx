"use client";

import Link from 'next/link';
import styles from './tests.module.scss';

const AVAILABLE_TESTS = [
    {
        id: 1,
        title: 'Итоговый тест: 1С:Бухгалтерия',
        courseName: 'Ведение учета в 1С:Бухгалтерия 8.3',
        passingScore: 80,
        maxScore: 100,
    },
    {
        id: 2,
        title: 'Модуль 2: Учет рабочего времени',
        courseName: 'Кадровый учет в 1С:ЗУП 8',
        passingScore: 70,
        maxScore: 100,
    }
];

const TEST_HISTORY = [
    {
        id: 101,
        title: 'Модуль 1: Основы 1С:ЗУП',
        attemptDate: '12 мая 2026',
        score: 95,
        maxScore: 100,
        isPassed: true,
    },
    {
        id: 102,
        title: 'Вводный тест: 1С:УТ',
        attemptDate: '10 мая 2026',
        score: 45,
        maxScore: 100,
        isPassed: false,
    },
    {
        id: 103,
        title: 'Настройка параметров учета',
        attemptDate: '5 мая 2026',
        score: 85,
        maxScore: 100,
        isPassed: true,
    }
];

export default function TestsPage() {
    return (
        <div className="p-10 space-y-10 max-w-[1600px] mx-auto w-full">

            <section className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Тестирования</h1>
                <p className="text-lg text-slate-500 font-medium">Проверка знаний и история ваших результатов.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Доступные для прохождения</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {AVAILABLE_TESTS.map(test => (
                        <div key={test.id}
                             className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all group">
                            <div className="flex items-start gap-4 mb-6">
                                <div
                                    className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{test.title}</h3>
                                    <p className="text-sm text-slate-500">{test.courseName}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Проходной балл</span>
                                    <span
                                        className="font-semibold text-slate-700">{test.passingScore} из {test.maxScore}</span>
                                </div>
                                <button
                                    className="px-5 py-2.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 hover:-translate-y-0.5 active:scale-95 transition-all text-sm shadow-md shadow-blue-700/20">
                                    Начать тест
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6">История попыток</h2>
                <div className="flex flex-col gap-4">
                    {TEST_HISTORY.map(history => (
                        <div key={history.id}
                             className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all">

                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{history.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                    <span>{history.attemptDate}</span>
                                </div>
                            </div>

                            <div
                                className="flex items-center gap-6 justify-between md:justify-end md:w-auto w-full pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">

                                <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-max
                                            ${history.isPassed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}
                                        `}>
                                            <span className="material-symbols-outlined text-[16px]">
                                                {history.isPassed ? 'check_circle' : 'cancel'}
                                            </span>
                                    {history.isPassed ? 'Сдан' : 'Не сдан'}
                                </div>

                                <div className="text-right min-w-[80px]">
                                    <span
                                        className="text-2xl font-black tracking-tighter text-slate-900">{history.score}</span>
                                    <span className="text-sm font-bold text-slate-400">/{history.maxScore}</span>
                                </div>

                                {history.isPassed ? (
                                    <button
                                        className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm w-full md:w-auto">
                                        Ошибки
                                    </button>
                                ) : (
                                    <button
                                        className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all text-sm shadow-md shadow-blue-700/20 w-full md:w-auto">
                                        Пересдать
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}