"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './lessons.module.scss';

const MOCK_LESSONS = [
    {
        id: 'l-1',
        order: 1,
        title: 'Введение и интерфейс программы',
        duration: '08:15',
        hasVideo: true,
        hasText: true,
        hasFiles: true,
        hasTest: false,
        isPublished: true,
    },
    {
        id: 'l-2',
        order: 2,
        title: 'Заполнение реквизитов организации',
        duration: '12:05',
        hasVideo: true,
        hasText: true,
        hasFiles: true,
        hasTest: true,
        isPublished: true,
    },
    {
        id: 'l-3',
        order: 3,
        title: 'Настройка начальных остатков предприятия',
        duration: '14:20',
        hasVideo: true,
        hasText: false,
        hasFiles: true,
        hasTest: true,
        isPublished: false,
    },
    {
        id: 'l-4',
        order: 4,
        title: 'Учет кассовых и банковских операций',
        duration: '00:00',
        hasVideo: false,
        hasText: true,
        hasFiles: false,
        hasTest: false,
        isPublished: false,
    }
];

export default function AdminLessonsPage() {
    const params = useParams();
    const courseId = params.courseID as string;

    const [lessons, setLessons] = useState(MOCK_LESSONS);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 lg:p-10 space-y-6 max-w-[1600px] mx-auto w-full font-sans animate-in fade-in duration-300">

            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Программа курса</h1>
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-bold border border-slate-200">
                            {lessons.length}
                        </span>
                    </div>
                    <p className="text-slate-500 font-medium">Управление списком уроков, материалами и тестированием.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button className="cursor-pointer flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">sort</span>
                        Изменить порядок
                    </button>
                    <Link
                        href={`/admin/dashboard/courses/${courseId}/lessons/new`}
                        className="cursor-pointer flex-1 md:flex-none px-5 py-2.5 bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-700/20 hover:bg-blue-800 hover:-translate-y-0.5 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Новый урок
                    </Link>
                </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Поиск урока по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                    />
                </div>
            </section>

            <section className="space-y-3">
                {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson) => (
                        <div key={lesson.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-300 transition-all">

                            <div className="flex items-center gap-4 w-full md:w-auto min-w-0">
                                <div className="cursor-grab text-slate-300 hover:text-slate-500 shrink-0 hidden md:block" title="Потяните для изменения порядка">
                                    <span className="material-symbols-outlined">drag_indicator</span>
                                </div>

                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                    {lesson.order}
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-bold text-slate-900 truncate">
                                            {lesson.title}
                                        </h3>
                                        {!lesson.isPublished && (
                                            <span className="shrink-0 bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                Черновик
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                                        <div className={`flex items-center gap-1 ${lesson.hasVideo ? 'text-blue-600' : 'opacity-50'}`} title={lesson.hasVideo ? 'Видео добавлено' : 'Нет видео'}>
                                            <span className="material-symbols-outlined text-[14px]">{lesson.hasVideo ? 'play_circle' : 'videocam_off'}</span>
                                            {lesson.duration}
                                        </div>
                                        <div className={`flex items-center gap-1 ${lesson.hasText ? 'text-slate-600' : 'opacity-50'}`} title={lesson.hasText ? 'Текст конспекта добавлен' : 'Нет текста'}>
                                            <span className="material-symbols-outlined text-[14px]">article</span>
                                            Конспект
                                        </div>
                                        <div className={`flex items-center gap-1 ${lesson.hasFiles ? 'text-emerald-600' : 'opacity-50'}`} title={lesson.hasFiles ? 'Файлы прикреплены' : 'Нет файлов'}>
                                            <span className="material-symbols-outlined text-[14px]">attach_file</span>
                                            Файлы
                                        </div>
                                        <div className={`flex items-center gap-1 ${lesson.hasTest ? 'text-amber-600' : 'opacity-50'}`} title={lesson.hasTest ? 'Тест добавлен' : 'Нет теста'}>
                                            <span className="material-symbols-outlined text-[14px]">quiz</span>
                                            Тест
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t border-slate-100 pt-3 md:pt-0 md:border-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/admin/dashboard/courses/${courseId}/lessons/${lesson.id}/edit`}
                                    className="cursor-pointer flex-1 md:flex-none px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-1 border border-slate-200 hover:border-blue-200"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Ред.
                                </Link>
                                <button className="cursor-pointer px-3 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center border border-slate-200 hover:border-red-200" title="Удалить урок">
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">menu_book</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Уроков пока нет</h3>
                        <p className="text-slate-500 mb-4 max-w-sm">Вы еще не добавили ни одного урока в этот курс. Нажмите «Новый урок», чтобы начать.</p>
                    </div>
                )}
            </section>
        </div>
    );
}