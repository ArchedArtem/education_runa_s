"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const INITIAL_LESSON = {
    title: '',
    videoType: 'link',
    videoUrl: '',
    content: '',
    isPublished: false,
};

const INITIAL_TEST = {
    isEnabled: false,
    passingScore: 80,
    questions: []
};

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; type: 'single' | 'multiple'; options: Option[] };

export default function NewLessonPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseID as string;

    const [activeTab, setActiveTab] = useState<'main' | 'files' | 'test'>('main');
    const [isSaving, setIsSaving] = useState(false);

    const [lessonData, setLessonData] = useState(INITIAL_LESSON);
    const [files, setFiles] = useState<any[]>([]);
    const [testData, setTestData] = useState<{isEnabled: boolean, passingScore: number, questions: Question[]}>(INITIAL_TEST);

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: `q-${Date.now()}`,
            text: '',
            type: 'single',
            options: [
                { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
                { id: `opt-${Date.now()}-2`, text: '', isCorrect: false }
            ]
        };
        setTestData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    };

    const handleAddOption = (questionId: string) => {
        setTestData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === questionId) {
                    return {
                        ...q,
                        options: [...q.options, { id: `opt-${Date.now()}`, text: '', isCorrect: false }]
                    };
                }
                return q;
            })
        }));
    };

    const handleSave = async () => {
        if (!lessonData.title) {
            alert('Пожалуйста, введите название урока!');
            setActiveTab('main');
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Новый урок успешно создан!');
            router.push(`/admin/dashboard/courses/${courseId}/lessons`);
        }, 800);
    };

    return (
        <div className="p-8 lg:p-10 space-y-6 max-w-[1600px] mx-auto w-full font-sans animate-in fade-in duration-300">

            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6 sticky top-0 bg-slate-50 z-10 pt-4 -mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Создание нового урока</h1>
                    <p className="text-slate-500 font-medium mt-1">Добавьте контент, прикрепите файлы и настройте тест.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => router.back()}
                        className="cursor-pointer flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all text-sm"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="cursor-pointer flex-1 md:flex-none px-6 py-2.5 bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-700/20 hover:bg-blue-800 hover:-translate-y-0.5 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isSaving ? 'autorenew' : 'add_circle'}
                        </span>
                        {isSaving ? 'Создание...' : 'Создать урок'}
                    </button>
                </div>
            </section>

            <section className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
                <button
                    onClick={() => setActiveTab('main')}
                    className={`cursor-pointer px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'main' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">article</span>
                    Основной контент
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`cursor-pointer px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'files' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">attach_file</span>
                    Материалы
                    {files.length > 0 && <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-xs ml-1">{files.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('test')}
                    className={`cursor-pointer px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'test' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">quiz</span>
                    Тестирование
                </button>
            </section>

            {activeTab === 'main' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Название урока <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={lessonData.title}
                                    onChange={e => setLessonData({...lessonData, title: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-700 focus:bg-white transition-all"
                                    placeholder="Например: Введение в интерфейс 1С"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Видео к уроку</label>

                                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                        <button
                                            onClick={() => setLessonData({...lessonData, videoType: 'link'})}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${lessonData.videoType === 'link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            По ссылке
                                        </button>
                                        <button
                                            onClick={() => setLessonData({...lessonData, videoType: 'upload'})}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${lessonData.videoType === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Свой файл
                                        </button>
                                    </div>
                                </div>

                                {lessonData.videoType === 'link' ? (
                                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                                        <input
                                            type="url"
                                            value={lessonData.videoUrl}
                                            onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-700 focus:bg-white transition-all"
                                            placeholder="https://youtube.com/... или https://rutube.ru/..."
                                        />
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 transition-colors cursor-pointer group animate-in fade-in zoom-in-95 duration-200">
                                        <span className="material-symbols-outlined text-3xl text-blue-600 mb-2 group-hover:scale-110 transition-transform">video_library</span>
                                        <p className="text-sm font-bold text-slate-900">Загрузить видеофайл</p>
                                        <p className="text-xs text-slate-500 mb-3">MP4, WebM (до 2 ГБ).</p>
                                        <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                                            Выбрать видео на компьютере
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Текстовый конспект</label>
                                </div>

                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden [&_.ql-toolbar]:bg-slate-50 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-b-slate-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:text-sm">
                                    <ReactQuill
                                        theme="snow"
                                        value={lessonData.content}
                                        onChange={(content) => setLessonData({...lessonData, content: content})}
                                        placeholder="Начните писать конспект урока здесь..."
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                ['link', 'image', 'video'],
                                                ['clean']
                                            ]
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Настройки публикации</h3>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full transition-colors relative ${lessonData.isPublished ? 'bg-green-500' : 'bg-slate-200'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${lessonData.isPublished ? 'left-7' : 'left-1'}`}></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900">Опубликовать урок сразу</span>
                                    <span className="text-xs text-slate-500">Сделать видимым для клиентов</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={lessonData.isPublished}
                                    onChange={e => setLessonData({...lessonData, isPublished: e.target.checked})}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'files' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in duration-300">
                    <div className="max-w-3xl mx-auto space-y-8">

                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl text-blue-600">cloud_upload</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Загрузить материалы</h3>
                            <p className="text-slate-500 text-sm mb-4">Нажмите или перетащите файлы сюда (PDF, DOCX, XLSX)</p>
                            <button className="px-5 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                                Выбрать файлы
                            </button>
                        </div>

                        {files.length === 0 && (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">folder_open</span>
                                <p className="text-slate-400 text-sm font-medium">К этому уроку пока не прикреплено файлов</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'test' && (
                <div className="space-y-6 animate-in fade-in duration-300">

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full transition-colors relative ${testData.isEnabled ? 'bg-amber-500' : 'bg-slate-200'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${testData.isEnabled ? 'left-7' : 'left-1'}`}></div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={testData.isEnabled}
                                    onChange={e => setTestData({...testData, isEnabled: e.target.checked})}
                                />
                            </label>
                            <div>
                                <h3 className="font-bold text-slate-900">Включить тест к этому уроку</h3>
                                <p className="text-xs text-slate-500">Клиент должен будет сдать его для завершения урока</p>
                            </div>
                        </div>

                        {testData.isEnabled && (
                            <div className="flex items-center gap-3 animate-in fade-in zoom-in-95">
                                <label className="text-sm font-bold text-slate-700">Проходной балл (%):</label>
                                <input
                                    type="number"
                                    value={testData.passingScore}
                                    min={0}
                                    max={100}
                                    onChange={e => setTestData({...testData, passingScore: Number(e.target.value)})}
                                    className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-center outline-none focus:border-amber-500"
                                />
                            </div>
                        )}
                    </div>

                    {testData.isEnabled && (
                        <div className="space-y-6">
                            {testData.questions.length === 0 ? (
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">quiz</span>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Вопросов пока нет</h3>
                                    <p className="text-slate-500 text-sm mb-6">Создайте первый вопрос для проверки знаний учеников</p>
                                    <button
                                        onClick={handleAddQuestion}
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Добавить вопрос
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {testData.questions.map((q, index) => (
                                        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group animate-in slide-in-from-bottom-2 fade-in">

                                            <button
                                                onClick={() => setTestData(prev => ({...prev, questions: prev.questions.filter(quest => quest.id !== q.id)}))}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                title="Удалить вопрос"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>

                                            <div className="flex gap-4 items-start mb-6">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={e => {
                                                            const newQuestions = [...testData.questions];
                                                            newQuestions[index].text = e.target.value;
                                                            setTestData({...testData, questions: newQuestions});
                                                        }}
                                                        className="w-full text-lg font-bold text-slate-900 outline-none border-b border-transparent focus:border-amber-500 pb-1 placeholder:text-slate-300 transition-colors"
                                                        placeholder="Введите текст вопроса..."
                                                    />
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`type-${q.id}`}
                                                                checked={q.type === 'single'}
                                                                onChange={() => {
                                                                    const newQuestions = [...testData.questions];
                                                                    newQuestions[index].type = 'single';
                                                                    setTestData({...testData, questions: newQuestions});
                                                                }}
                                                                className="accent-amber-600"
                                                            />
                                                            Один вариант
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`type-${q.id}`}
                                                                checked={q.type === 'multiple'}
                                                                onChange={() => {
                                                                    const newQuestions = [...testData.questions];
                                                                    newQuestions[index].type = 'multiple';
                                                                    setTestData({...testData, questions: newQuestions});
                                                                }}
                                                                className="accent-amber-600"
                                                            />
                                                            Несколько вариантов
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pl-12 space-y-3">
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...testData.questions];
                                                                if (q.type === 'single') {
                                                                    newQuestions[index].options.forEach(o => o.isCorrect = false);
                                                                }
                                                                newQuestions[index].options[optIndex].isCorrect = !opt.isCorrect;
                                                                setTestData({...testData, questions: newQuestions});
                                                            }}
                                                            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border cursor-pointer transition-colors ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-green-400'}`}
                                                            title="Пометить как правильный ответ"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={opt.text}
                                                            onChange={e => {
                                                                const newQuestions = [...testData.questions];
                                                                newQuestions[index].options[optIndex].text = e.target.value;
                                                                setTestData({...testData, questions: newQuestions});
                                                            }}
                                                            className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-700 placeholder:text-slate-300"
                                                            placeholder={`Вариант ответа ${optIndex + 1}`}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...testData.questions];
                                                                newQuestions[index].options = newQuestions[index].options.filter(o => o.id !== opt.id);
                                                                setTestData({...testData, questions: newQuestions});
                                                            }}
                                                            className="text-slate-300 hover:text-red-500 cursor-pointer"
                                                            title="Удалить вариант"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => handleAddOption(q.id)}
                                                    className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors mt-2 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                                    Добавить вариант
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddQuestion}
                                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-amber-400 hover:text-amber-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                        Добавить следующий вопрос
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}