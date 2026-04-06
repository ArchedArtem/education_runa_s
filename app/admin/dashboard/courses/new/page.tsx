"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INITIAL_COURSE = {
    title: '',
    softwareProduct: '',
    authors: '',
    description: '',
    thumbnailUrl: '',
    isPublished: false,
};

export default function NewCoursePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [courseData, setCourseData] = useState(INITIAL_COURSE);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            setCourseData({ ...courseData, thumbnailUrl: file.name });
        }
    };

    const handleSave = async () => {
        if (!courseData.title || !courseData.softwareProduct) {
            alert('Пожалуйста, заполните обязательные поля (Название и Продукт 1С)');
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Новый курс успешно создан!');
            router.push('/admin/dashboard/courses');
        }, 800);
    };

    return (
        <div className="p-8 lg:p-10 space-y-6 max-w-[1600px] mx-auto w-full font-sans animate-in fade-in duration-300">

            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6 sticky top-0 bg-slate-50 z-10 pt-4 -mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Создание нового курса</h1>
                    <p className="text-slate-500 font-medium mt-1">Основная информация об учебной программе.</p>
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
                        {isSaving ? 'Создание...' : 'Создать курс'}
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Название курса <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={courseData.title}
                                onChange={e => setCourseData({...courseData, title: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-700 focus:bg-white transition-all"
                                placeholder="Например: Бухгалтерский учет с нуля"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Продукт 1С <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={courseData.softwareProduct}
                                    onChange={e => setCourseData({...courseData, softwareProduct: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-700 focus:bg-white transition-all"
                                    placeholder="Например: 1С:Бухгалтерия"
                                    list="1c-products"
                                    required
                                />
                                <datalist id="1c-products">
                                    <option value="1С:Бухгалтерия" />
                                    <option value="1С:ЗУП" />
                                    <option value="1С:УТ" />
                                    <option value="1С:ERP" />
                                    <option value="1С:УНФ" />
                                </datalist>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Авторы курса</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">group</span>
                                    <input
                                        type="text"
                                        value={courseData.authors}
                                        onChange={e => setCourseData({...courseData, authors: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-700 focus:bg-white transition-all"
                                        placeholder="Иванов И.И., Петров П.П."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Краткое описание</label>
                            <textarea
                                value={courseData.description}
                                onChange={e => setCourseData({...courseData, description: e.target.value})}
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-700 focus:bg-white transition-all resize-y"
                                placeholder="Опишите, чему научится клиент после прохождения курса..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">

                    {/* Обложка */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Обложка курса</h3>

                        {previewImage ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
                                <img src={previewImage} alt="Предпросмотр обложки" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3 backdrop-blur-sm">
                                    <label className="px-4 py-2 bg-white text-slate-900 font-bold text-sm rounded-lg cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                                        Заменить
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                    <button
                                        onClick={() => setPreviewImage(null)}
                                        className="text-white text-sm font-semibold hover:text-red-400 transition-colors"
                                    >
                                        Удалить обложку
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 transition-colors cursor-pointer group">
                                <span className="material-symbols-outlined text-4xl text-blue-600 mb-3 group-hover:scale-110 transition-transform">add_photo_alternate</span>
                                <p className="text-sm font-bold text-slate-900">Загрузить изображение</p>
                                <p className="text-xs text-slate-500 mt-1 mb-4">JPG, PNG или WebP<br/>(рекомендуемое соотношение 16:9)</p>
                                <span className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm text-xs transition-colors">
                                    Выбрать файл
                                </span>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Публикация</h3>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full transition-colors relative ${courseData.isPublished ? 'bg-green-500' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${courseData.isPublished ? 'left-7' : 'left-1'}`}></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">Опубликовать курс</span>
                                <span className="text-xs text-slate-500">Сделать видимым в каталоге</span>
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={courseData.isPublished}
                                onChange={e => setCourseData({...courseData, isPublished: e.target.checked})}
                            />
                        </label>
                    </div>

                </div>
            </div>
        </div>
    );
}