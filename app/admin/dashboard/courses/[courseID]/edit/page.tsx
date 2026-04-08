"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './edit-course.module.scss';

const MOCK_COURSE = {
    id: '1',
    title: 'Ведение учета в 1С:Бухгалтерия 8.3',
    softwareProduct: '1С:Бухгалтерия',
    authors: 'Иванова Е.А., Смирнов В.П.',
    description: 'Изучение основных механизмов программы, настройка параметров учета, ввод начальных остатков и формирование бухгалтерской отчетности.',
    thumbnailUrl: 'https://placehold.co/800x450/eff6ff/1d4ed8?text=1C+Course+Thumbnail',
    isPublished: true,
};

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseID as string;

    const [isSaving, setIsSaving] = useState(false);
    const [courseData, setCourseData] = useState(MOCK_COURSE);
    const [previewImage, setPreviewImage] = useState<string | null>(MOCK_COURSE.thumbnailUrl);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            setCourseData({ ...courseData, thumbnailUrl: file.name });
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        setCourseData({ ...courseData, thumbnailUrl: '' });
    };

    const handleSave = async () => {
        if (!courseData.title || !courseData.softwareProduct) {
            alert('Пожалуйста, заполните обязательные поля (Название и Продукт 1С)');
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Изменения успешно сохранены!');
            router.push('/admin/dashboard/courses');
        }, 800);
    };

    return (
        <div className={styles.container}>

            <section className={styles.header}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Редактирование курса</h1>
                    <p className={styles.subtitle}>Изменение информации об учебной программе.</p>
                </div>

                <div className={styles.headerButtons}>
                    <button
                        onClick={() => router.back()}
                        className={styles.btnCancel}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={styles.btnSave}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {isSaving ? 'autorenew' : 'save'}
                        </span>
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            </section>

            <div className={styles.gridContainer}>
                <div className={styles.formColumn}>
                    <div className={styles.card}>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Название курса <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                value={courseData.title}
                                onChange={e => setCourseData({...courseData, title: e.target.value})}
                                className={styles.input}
                                placeholder="Например: Бухгалтерский учет с нуля"
                                required
                            />
                        </div>

                        <div className={styles.twoCols}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Продукт 1С <span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    value={courseData.softwareProduct}
                                    onChange={e => setCourseData({...courseData, softwareProduct: e.target.value})}
                                    className={styles.input}
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

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Авторы курса</label>
                                <div className={styles.inputWithIconWrapper}>
                                    <span className={`material-symbols-outlined ${styles.inputIcon}`}>group</span>
                                    <input
                                        type="text"
                                        value={courseData.authors}
                                        onChange={e => setCourseData({...courseData, authors: e.target.value})}
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                        placeholder="Иванов И.И., Петров П.П."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Краткое описание</label>
                            <textarea
                                value={courseData.description}
                                onChange={e => setCourseData({...courseData, description: e.target.value})}
                                className={styles.textarea}
                                placeholder="Опишите, чему научится клиент после прохождения курса..."
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.sideColumn}>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Обложка курса</h3>

                        {previewImage ? (
                            <div className={styles.previewWrapper}>
                                <img src={previewImage} alt="Обложка курса" />
                                <div className={styles.previewOverlay}>
                                    <label className={styles.btnReplace}>
                                        Заменить
                                        <input type="file" accept="image/*" className={styles.hiddenInput} onChange={handleImageUpload} />
                                    </label>
                                    <button
                                        onClick={handleRemoveImage}
                                        className={styles.btnDeleteCover}
                                    >
                                        Удалить обложку
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className={styles.uploadPlaceholder}>
                                <span className={`material-symbols-outlined ${styles.uploadIcon}`}>add_photo_alternate</span>
                                <p className={styles.uploadTitle}>Загрузить изображение</p>
                                <p className={styles.uploadSubtitle}>JPG, PNG или WebP<br/>(рекомендуемое соотношение 16:9)</p>
                                <span className={styles.uploadBtn}>
                                    Выбрать файл
                                </span>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    className={styles.hiddenInput}
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Публикация</h3>

                        <label className={styles.toggleWrapper}>
                            <div className={`${styles.toggleTrack} ${courseData.isPublished ? styles.active : styles.inactive}`}>
                                <div className={`${styles.toggleThumb} ${courseData.isPublished ? styles.active : styles.inactive}`}></div>
                            </div>
                            <div className={styles.toggleLabels}>
                                <span className={styles.mainLabel}>Опубликовать курс</span>
                                <span className={styles.subLabel}>Сделать видимым в каталоге</span>
                            </div>
                            <input
                                type="checkbox"
                                className={styles.hiddenInput}
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