"use client";

import Link from 'next/link';
import styles from './course.module.scss';

const MOCK_COURSE_DETAILS = {
    id: 1,
    title: 'Ведение учета в 1С:Бухгалтерия 8.3',
    description: 'Полный курс по освоению "1С:Бухгалтерия 8.3". Вы научитесь настраивать параметры учета, вводить начальные остатки, работать с банковскими выписками, начислять зарплату и формировать регламентированную отчетность.',
    software_product: '1С:Бухгалтерия',
    thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000',
    authors: 'Методический отдел Руна С, Методический отдел Руна С',
    lessons: [
        { id: 101, title: 'Введение. Настройка параметров учета', is_completed: true },
        { id: 102, title: 'Ввод начальных остатков по счетам', is_completed: true },
        { id: 103, title: 'Учет кассовых операций', is_completed: false },
        { id: 104, title: 'Банковские выписки и платежные поручения', is_completed: false },
        { id: 105, title: 'Покупка и продажа товаров. Счета-фактуры', is_completed: false },
        { id: 106, title: 'Закрытие месяца и формирование баланса', is_completed: false },
    ]
};

export default function CourseOverviewPage() {
    const course = MOCK_COURSE_DETAILS;

    const totalLessons = course.lessons.length;
    const completedCount = course.lessons.filter(l => l.is_completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isAllLessonsCompleted = completedCount === totalLessons && totalLessons > 0;

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto w-full font-sans">

            <section
                className={`${styles.heroBanner} shadow-lg`}
                style={{ backgroundImage: `url(${course.thumbnail_url})` }}
            >
                <div className={styles.heroOverlay}></div>

                <div className={`${styles.heroContent} p-8 md:p-12`}>
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-md border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            {course.software_product}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
                            {course.title}
                        </h1>
                        <div className="flex items-center gap-2 text-blue-100 font-medium mt-4">
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            Авторы: {course.authors ? course.authors : 'Методический отдел Руна С'}
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Детальное описание курса</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {course.description}
                        </p>
                    </section>

                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Программа</h2>
                            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                                {completedCount} / {totalLessons} пройдено
                            </span>
                        </div>

                        <div className="space-y-3">
                            {course.lessons.map((lesson, index) => (
                                <Link
                                    href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                                    key={lesson.id}
                                    className={`${styles.lessonItem} ${lesson.is_completed ? styles.completed : styles.notCompleted} flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 gap-4`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            lesson.is_completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            <span className="material-symbols-outlined text-[18px]">
                                                {lesson.is_completed ? 'check' : 'play_arrow'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Урок {index + 1}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-900">
                                                {lesson.title}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium sm:ml-auto">
                                        {lesson.is_completed ? (
                                            <span className="text-green-600 font-bold">Пройдено</span>
                                        ) : (
                                            <span className="text-blue-600 font-bold">Не пройдено</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Ваш прогресс</h3>

                        <div className="mb-2 flex items-center justify-between text-sm font-bold">
                            <span className="text-slate-600">Освоено</span>
                            <span className="text-blue-700">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                            <div
                                className="bg-blue-700 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <Link
                            href={`/dashboard/courses/${course.id}/lessons/${course.lessons.find(l => !l.is_completed)?.id || course.lessons[0].id}`}
                            className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-center shadow-lg shadow-blue-700/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">play_circle</span>
                            {completedCount > 0 && completedCount < totalLessons ? 'Продолжить обучение' :
                                completedCount === totalLessons ? 'Повторить материалы' : 'Начать обучение'}
                        </Link>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-colors duration-500 ${isAllLessonsCompleted ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAllLessonsCompleted ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-400'}`}>
                                <span className="material-symbols-outlined text-[22px]">quiz</span>
                            </div>
                            <h4 className={`font-bold text-lg ${isAllLessonsCompleted ? 'text-indigo-900' : 'text-slate-500'}`}>
                                Итоговый тест
                            </h4>
                        </div>

                        <p className={`text-sm mb-6 font-medium ${isAllLessonsCompleted ? 'text-indigo-700/80' : 'text-slate-500'}`}>
                            {isAllLessonsCompleted
                                ? 'Все уроки пройдены! Подтвердите свои знания, чтобы завершить курс.'
                                : 'Тест будет доступен после завершения всех уроков программы.'}
                        </p>

                        {isAllLessonsCompleted ? (
                            <Link
                                href={`/dashboard/courses/${course.id}/test`}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">check_circle</span>
                                Сдать тест
                            </Link>
                        ) : (
                            <div className="w-full py-3 bg-slate-200/50 text-slate-400 font-bold rounded-xl text-center flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                Тест заблокирован
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}