"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './new-course.module.scss';

const INITIAL_COURSE = {
    title: '',
    softwareProduct: '',
    authors: '',
    description: '',
    isPublished: false,
    thumbnailUrl: undefined
};

export default function NewCoursePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [courseData, setCourseData] = useState(INITIAL_COURSE);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        const tempUrl = URL.createObjectURL(file);
        setPreviewImage(tempUrl);
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        setSelectedFile(null);
    };

    const handleSave = async () => {
        if (!courseData.title || !courseData.softwareProduct) {
            alert('Пожалуйста, заполните обязательные поля (Название и Продукт 1С)');
            return;
        }

        setIsSaving(true);
        let finalThumbnailUrl = courseData.thumbnailUrl;

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Ошибка загрузки изображения');

                const uploadData = await uploadRes.json();
                finalThumbnailUrl = uploadData.url;
            }

            const coursePayload = {
                title: courseData.title,
                softwareProduct: courseData.softwareProduct,
                authors: courseData.authors,
                description: courseData.description,
                thumbnailUrl: finalThumbnailUrl,
                isPublished: courseData.isPublished
            };

            const response = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(coursePayload)
            });

            if (!response.ok) throw new Error('Ошибка сохранения курса в БД');

            setIsSaving(false);
            alert('Новый курс успешно создан!');
            router.push('/admin/dashboard/courses');

        } catch (err) {
            alert('Произошла ошибка при сохранении курса');
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>

            <section className={styles.header}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Создание нового курса</h1>
                    <p className={styles.subtitle}>Основная информация об учебной программе.</p>
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
                            {isSaving ? 'autorenew' : 'add_circle'}
                        </span>
                        {isSaving ? 'Сохранение...' : 'Создать курс'}
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
                                <img src={previewImage} alt="Предпросмотр обложки" />
                                <div className={styles.previewOverlay}>
                                    <label className={styles.btnReplace}>
                                        Заменить
                                        <input type="file" accept="image/*" className={styles.hiddenInput} onChange={handleImageSelection} />
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
                                    onChange={handleImageSelection}
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