"use client";

import Link from 'next/link';
import { useState } from 'react';
import styles from './lesson.module.scss';
import {useRouter} from "next/navigation";

const COURSE_INFO = {
    id: 'c-1',
};

const LESSON_DATA = {
    id: 'l-3',
    title: 'Настройка начальных остатков предприятия',
    content: `
        <h2>Инструкция по вводу данных</h2>
        <p>Перед началом работы убедитесь, что у вас подготовлена оборотно-сальдовая ведомость.</p>
        <ul>
            <li>Проверьте счета 01, 02 и 10.</li>
            <li>Используйте помощник ввода остатков.</li>
        </ul>
    `,
    videoUrl: 'https://example.com/video.mp4',
    isCompleted: false,
    hasTest: true,
};

const ATTACHMENTS = [
    { id: 1, name: 'Шаблон_импорта.xlsx', size: '156 KB', icon: 'table' },
    { id: 2, name: 'Справочник_счетов.pdf', size: '2.1 MB', icon: 'picture_as_pdf' },
];

const PLAYLIST = [
    { id: 'l-1', title: 'Введение и интерфейс программы', duration: '08:15', isCompleted: true, isCurrent: false, hasTest: false },
    { id: 'l-2', title: 'Заполнение реквизитов организации', duration: '12:05', isCompleted: true, isCurrent: false, hasTest: true },
    { id: 'l-3', title: 'Настройка начальных остатков предприятия', duration: '14:20', isCompleted: false, isCurrent: true, hasTest: true },
    { id: 'l-4', title: 'Учет кассовых и банковских операций', duration: '22:10', isCompleted: false, isCurrent: false, hasTest: false },
];

export default function LessonPage() {
    const router = useRouter();
    const [isCompleted, setIsCompleted] = useState(LESSON_DATA.isCompleted);
    const [activeTab, setActiveTab] = useState<'playlist' | 'materials'>('playlist');

    const handleActionClick = () => {
        if (LESSON_DATA.hasTest) {
            router.push(`/dashboard/courses/${COURSE_INFO.id}/lessons/${LESSON_DATA.id}/test`);
        } else {
            setIsCompleted(!isCompleted);
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full font-sans space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {LESSON_DATA.videoUrl && (
                        <section className={styles.videoContainer}>
                            <video controls src={LESSON_DATA.videoUrl} className="w-full h-full" />
                        </section>
                    )}

                    <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 pb-8">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {LESSON_DATA.title}
                        </h1>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={handleActionClick}
                                className={`cursor-pointer h-11 px-5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 border ${
                                    LESSON_DATA.hasTest
                                        ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                        : isCompleted
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {LESSON_DATA.hasTest ? 'quiz' : isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                {LESSON_DATA.hasTest ? 'Пройти тест' : isCompleted ? 'Пройдено' : 'Завершить'}
                            </button>

                            <button className="cursor-pointer h-11 px-5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2">
                                Далее
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        </div>
                    </section>

                    {LESSON_DATA.content && (
                        <section className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">description</span>
                                Конспект урока
                            </h2>
                            <div
                                className={`${styles.textContent} bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-sm`}
                                dangerouslySetInnerHTML={{ __html: LESSON_DATA.content }}
                            />
                        </section>
                    )}
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] lg:h-[calc(100vh-120px)] sticky top-6">
                        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
                            <button
                                onClick={() => setActiveTab('playlist')}
                                className={`cursor-pointer flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                    activeTab === 'playlist' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Содержание
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`cursor-pointer flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                    activeTab === 'materials' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Файлы ({ATTACHMENTS.length})
                            </button>
                        </div>

                        {activeTab === 'playlist' && (
                            <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${styles.sidebarScroll}`}>
                                {PLAYLIST.map((lesson, index) => (
                                    <Link
                                        href={`/dashboard/courses/${COURSE_INFO.id}/lessons/${lesson.id}`}
                                        key={lesson.id}
                                        className={`group flex gap-4 p-3 rounded-xl border transition-all ${
                                            lesson.isCurrent
                                                ? 'bg-blue-50/50 border-blue-200'
                                                : 'bg-white border-transparent hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center mt-0.5 shrink-0">
                                            {lesson.isCompleted ? (
                                                <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                                            ) : lesson.isCurrent ? (
                                                <span className="material-symbols-outlined text-blue-600 text-[20px]">play_circle</span>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300 w-5 text-center">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-sm font-semibold line-clamp-2 ${lesson.isCurrent ? 'text-blue-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                {lesson.title}
                                            </span>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {lesson.duration}
                                                </span>
                                                {lesson.hasTest && (
                                                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                                        <span className="material-symbols-outlined text-[12px]">quiz</span>
                                                        Тест
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${styles.sidebarScroll}`}>
                                {ATTACHMENTS.length > 0 ? (
                                    ATTACHMENTS.map(file => (
                                        <a
                                            href="#"
                                            key={file.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                    <span className="material-symbols-outlined">{file.icon}</span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-900 truncate">{file.name}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 uppercase">{file.size}</span>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600">download</span>
                                        </a>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
                                        <span className="text-sm">К этому уроку нет файлов</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}