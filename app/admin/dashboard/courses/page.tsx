"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Course = {
    id: number;
    title: string;
    description: string | null;
    software_product: string;
    thumbnail_url: string | null;
    is_published: boolean;
    created_at: string;
    _count: {
        lessons: number;
    }
};

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/admin/courses');
                if (!res.ok) throw new Error('Ошибка сервера при загрузке');
                const data = await res.json();
                setCourses(data);
            } catch (error) {
                console.error(error);
                alert('Не удалось загрузить список курсов');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleDelete = async (id: number, title: string) => {
        const confirmDelete = window.confirm(`Вы действительно хотите удалить курс "${title}"? Все уроки внутри него также будут удалены.`);

        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Ошибка при удалении');

            setCourses(courses.filter(course => course.id !== id));
            alert('Курс удален!');

        } catch (error) {
            console.error(error);
            alert('Произошла ошибка при удалении курса');
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.software_product.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Published' && course.is_published) ||
            (statusFilter === 'Draft' && !course.is_published);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8 lg:p-10 space-y-6 max-w-[1600px] mx-auto w-full font-sans animate-in fade-in duration-300">

            <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Курсы и Уроки</h1>
                    <p className="text-slate-500 font-medium mt-1">Управление образовательным контентом платформы.</p>
                </div>
                <Link href="/admin/dashboard/courses/new" className="cursor-pointer px-5 py-2.5 bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-700/20 hover:bg-blue-800 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Создать курс
                </Link>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="relative w-full lg:max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Поиск по названию или продукту 1С..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto pb-1 lg:pb-0">
                    <button
                        onClick={() => setStatusFilter('All')}
                        className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            statusFilter === 'All' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Все курсы
                    </button>
                    <button
                        onClick={() => setStatusFilter('Published')}
                        className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            statusFilter === 'Published' ? 'bg-green-600 text-white shadow-md shadow-green-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Опубликованы
                    </button>
                    <button
                        onClick={() => setStatusFilter('Draft')}
                        className={`cursor-pointer px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            statusFilter === 'Draft' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Черновики
                    </button>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-20 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin mb-3">progress_activity</span>
                        <p className="text-slate-500 font-medium">Загрузка курсов...</p>
                    </div>
                ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md hover:border-blue-200 transition-all group">

                            <div className="h-48 md:h-auto md:w-64 shrink-0 relative bg-slate-100 overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover absolute inset-0" />
                                ) : (
                                    <div className="absolute inset-0 opacity-80 bg-gradient-to-br from-blue-600 to-blue-800"></div>
                                )}
                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>

                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5 z-10">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <span className="text-[10px] font-bold text-slate-800 tracking-wide uppercase">
                                        {course.software_product}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h2 className="text-xl font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                            {course.title}
                                        </h2>
                                        <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shrink-0 ${
                                            course.is_published ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                            {course.is_published ? 'Опубликован' : 'Черновик'}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 max-w-2xl">
                                        {course.description || 'Описание отсутствует'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">play_lesson</span>
                                        <span className="font-semibold text-slate-700">{course._count.lessons}</span> уроков
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        Создан: {new Date(course.created_at).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-row md:flex-col justify-end md:justify-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/dashboard/courses/${course.id}/lessons`}
                                    className="px-4 py-2 bg-white border border-slate-200 text-blue-700 font-bold rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm flex items-center justify-center gap-2 w-full md:w-auto"
                                >
                                    <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                                    Уроки
                                </Link>

                                <Link href={`/admin/dashboard/courses/${course.id}/edit`}
                                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-100 transition-colors text-sm flex items-center justify-center gap-2 w-full md:w-auto">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Изменить
                                </Link>

                                <button
                                    onClick={() => handleDelete(course.id, course.title)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-red-600 font-semibold rounded-lg shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors text-sm flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Курсы не найдены</h3>
                        <p className="text-slate-500 mb-4">В базе данных пока нет курсов, соответствующих вашему запросу.</p>
                        <button
                            onClick={() => {setSearchQuery(''); setStatusFilter('All');}}
                            className="text-blue-700 font-bold hover:underline cursor-pointer"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}