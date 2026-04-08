"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './edit-lesson.module.scss';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const INITIAL_LESSON = {
    title: 'Настройка начальных остатков предприятия',
    videoType: 'link',
    videoUrl: 'https://youtube.com/watch?v=example',
    content: '<p>Перед началом работы убедитесь, что у вас подготовлена <strong>оборотно-сальдовая ведомость</strong>.</p>',
    isPublished: false,
};

const INITIAL_FILES = [
    { id: 1, name: 'ОСВ_Шаблон.xlsx', size: '1.2 MB' },
    { id: 2, name: 'Справочник_счетов.pdf', size: '3.4 MB' }
];

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; type: 'single' | 'multiple'; options: Option[] };

const INITIAL_TEST: { isEnabled: boolean, passingScore: number, questions: Question[] } = {
    isEnabled: true,
    passingScore: 80,
    questions: [
        {
            id: 'q1',
            text: 'Какой счет используется для ввода начальных остатков?',
            type: 'single',
            options: [
                { id: 'o1', text: 'Счет 000', isCorrect: true },
                { id: 'o2', text: 'Счет 99.01', isCorrect: false },
                { id: 'o3', text: 'Счет 84.01', isCorrect: false }
            ]
        }
    ]
};

export default function EditLessonPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseID as string;

    const [activeTab, setActiveTab] = useState<'main' | 'files' | 'test'>('main');
    const [isSaving, setIsSaving] = useState(false);

    const [lessonData, setLessonData] = useState(INITIAL_LESSON);
    const [files, setFiles] = useState(INITIAL_FILES);
    const [testData, setTestData] = useState(INITIAL_TEST);

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
            alert('Изменения успешно сохранены!');
            router.push(`/admin/dashboard/courses/${courseId}/lessons`);
        }, 800);
    };

    return (
        <div className={styles.pageContainer}>
            <section className={styles.stickyHeader}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.pageTitle}>Редактирование урока</h1>
                    <p className={styles.pageSubtitle}>Настройка контента, материалов и тестирования.</p>
                </div>

                <div className={styles.headerActions}>
                    <button onClick={() => router.back()} className={styles.btnSecondary}>
                        Отмена
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className={styles.btnPrimary}>
                        <span className="material-symbols-outlined">
                            {isSaving ? 'autorenew' : 'save'}
                        </span>
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            </section>

            <section className={styles.tabsNav}>
                <div className={styles.tabsList}>
                    <button
                        onClick={() => setActiveTab('main')}
                        className={`${styles.tabItem} ${activeTab === 'main' ? styles.tabActive : ''}`}
                    >
                        <span className="material-symbols-outlined">article</span>
                        <span className={styles.tabText}>Основной контент</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`${styles.tabItem} ${activeTab === 'files' ? styles.tabActive : ''}`}
                    >
                        <span className="material-symbols-outlined">attach_file</span>
                        <span className={styles.tabText}>Материалы</span>
                        {files.length > 0 && <span className={styles.badge}>{files.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('test')}
                        className={`${styles.tabItem} ${activeTab === 'test' ? styles.tabActive : ''}`}
                    >
                        <span className="material-symbols-outlined">quiz</span>
                        <span className={styles.tabText}>Тестирование</span>
                    </button>
                </div>
            </section>

            {activeTab === 'main' && (
                <div className={styles.gridLayout}>
                    <div className={styles.mainCol}>
                        <div className={styles.card}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Название урока <span>*</span></label>
                                <input
                                    type="text"
                                    value={lessonData.title}
                                    onChange={e => setLessonData({...lessonData, title: e.target.value})}
                                    className={styles.textInput}
                                    placeholder="Введите название урока"
                                />
                            </div>

                            <div className={styles.videoSection}>
                                <div className={styles.videoHeader}>
                                    <label className={styles.label}>Видео к уроку</label>
                                    <div className={styles.toggleGroup}>
                                        <button
                                            onClick={() => setLessonData({...lessonData, videoType: 'link'})}
                                            className={`${styles.toggleBtn} ${lessonData.videoType === 'link' ? styles.toggleActive : ''}`}
                                        >
                                            По ссылке
                                        </button>
                                        <button
                                            onClick={() => setLessonData({...lessonData, videoType: 'upload'})}
                                            className={`${styles.toggleBtn} ${lessonData.videoType === 'upload' ? styles.toggleActive : ''}`}
                                        >
                                            Свой файл
                                        </button>
                                    </div>
                                </div>

                                {lessonData.videoType === 'link' ? (
                                    <div className={styles.inputWithIcon}>
                                        <span className="material-symbols-outlined">link</span>
                                        <input
                                            type="url"
                                            value={lessonData.videoUrl}
                                            onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})}
                                            className={styles.textInput}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.uploadBox}>
                                        <span className="material-symbols-outlined">video_library</span>
                                        <p className={styles.uploadTitle}>Загрузить видеофайл</p>
                                        <p className={styles.uploadHint}>MP4, WebM (до 2 ГБ)</p>
                                        <button className={styles.btnSmall}>Выбрать видео</button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.editorSection}>
                                <label className={styles.label}>Текстовый конспект</label>
                                <div className={styles.quillWrapper}>
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

                    <div className={styles.sideCol}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Настройки публикации</h3>
                            <label className={styles.switchWrapper}>
                                <div className={`${styles.switchTrack} ${lessonData.isPublished ? styles.switchOn : ''}`}>
                                    <div className={styles.switchThumb}></div>
                                </div>
                                <div className={styles.switchLabels}>
                                    <span className={styles.switchMain}>Опубликовать урок</span>
                                    <span className={styles.switchSub}>Видимый для клиентов</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className={styles.hiddenInput}
                                    checked={lessonData.isPublished}
                                    onChange={e => setLessonData({...lessonData, isPublished: e.target.checked})}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'files' && (
                <div className={styles.card}>
                    <div className={styles.filesContent}>
                        <div className={styles.uploadBoxLarge}>
                            <div className={styles.uploadCircle}>
                                <span className="material-symbols-outlined">cloud_upload</span>
                            </div>
                            <h3 className={styles.uploadTitleLarge}>Загрузить материалы</h3>
                            <p className={styles.uploadSubtitle}>PDF, DOCX, XLSX и другие</p>
                            <button className={styles.btnGhost}>Выбрать файлы</button>
                        </div>

                        {files.length > 0 && (
                            <div className={styles.attachedFilesList}>
                                <h3 className={styles.attachedTitle}>Прикрепленные файлы</h3>
                                {files.map(file => (
                                    <div key={file.id} className={styles.fileItem}>
                                        <div className={styles.fileMain}>
                                            <div className={styles.fileIconBox}>
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <div className={styles.fileText}>
                                                <p className={styles.fileName}>{file.name}</p>
                                                <p className={styles.fileSize}>{file.size}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                                            className={styles.btnDeleteFile}
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'test' && (
                <div className={styles.testContainer}>
                    <div className={styles.testHeaderCard}>
                        <div className={styles.testToggleBox}>
                            <label className={styles.switchWrapper}>
                                <div className={`${styles.switchTrack} ${testData.isEnabled ? styles.switchOnTest : ''}`}>
                                    <div className={styles.switchThumb}></div>
                                </div>
                                <input
                                    type="checkbox"
                                    className={styles.hiddenInput}
                                    checked={testData.isEnabled}
                                    onChange={e => setTestData({...testData, isEnabled: e.target.checked})}
                                />
                            </label>
                            <div className={styles.testTitleInfo}>
                                <h3 className={styles.cardTitleInline}>Тестирование после урока</h3>
                                <p className={styles.switchSub}>Обязателен для завершения урока</p>
                            </div>
                        </div>

                        {testData.isEnabled && (
                            <div className={styles.scoreInputGroup}>
                                <label>Проходной балл (%):</label>
                                <input
                                    type="number"
                                    value={testData.passingScore}
                                    min={0} max={100}
                                    onChange={e => setTestData({...testData, passingScore: Number(e.target.value)})}
                                    className={styles.scoreInput}
                                />
                            </div>
                        )}
                    </div>

                    {testData.isEnabled && (
                        <div className={styles.questionsList}>
                            {testData.questions.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <span className="material-symbols-outlined">quiz</span>
                                    <h3>Вопросов пока нет</h3>
                                    <p>Создайте первый вопрос для проверки знаний</p>
                                    <button onClick={handleAddQuestion} className={styles.btnAmber}>
                                        <span className="material-symbols-outlined">add</span>
                                        Добавить вопрос
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {testData.questions.map((q, index) => (
                                        <div key={q.id} className={styles.questionCard}>
                                            <button
                                                onClick={() => setTestData(prev => ({...prev, questions: prev.questions.filter(quest => quest.id !== q.id)}))}
                                                className={styles.btnDeleteQuestion}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>

                                            <div className={styles.questionHeader}>
                                                <div className={styles.qNumber}>{index + 1}</div>
                                                <div className={styles.qInputs}>
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={e => {
                                                            const newQuestions = [...testData.questions];
                                                            newQuestions[index].text = e.target.value;
                                                            setTestData({...testData, questions: newQuestions});
                                                        }}
                                                        className={styles.qTitleInput}
                                                        placeholder="Введите текст вопроса..."
                                                    />
                                                    <div className={styles.qTypeGroup}>
                                                        <label className={styles.radioLabel}>
                                                            <input
                                                                type="radio"
                                                                checked={q.type === 'single'}
                                                                onChange={() => {
                                                                    const newQuestions = [...testData.questions];
                                                                    newQuestions[index].type = 'single';
                                                                    setTestData({...testData, questions: newQuestions});
                                                                }}
                                                            />
                                                            Один вариант
                                                        </label>
                                                        <label className={styles.radioLabel}>
                                                            <input
                                                                type="radio"
                                                                checked={q.type === 'multiple'}
                                                                onChange={() => {
                                                                    const newQuestions = [...testData.questions];
                                                                    newQuestions[index].type = 'multiple';
                                                                    setTestData({...testData, questions: newQuestions});
                                                                }}
                                                            />
                                                            Несколько
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.optionsList}>
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={opt.id} className={`${styles.optionItem} ${opt.isCorrect ? styles.optionCorrect : ''}`}>
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...testData.questions];
                                                                if (q.type === 'single') {
                                                                    newQuestions[index].options.forEach(o => o.isCorrect = false);
                                                                }
                                                                newQuestions[index].options[optIndex].isCorrect = !opt.isCorrect;
                                                                setTestData({...testData, questions: newQuestions});
                                                            }}
                                                            className={`${styles.checkBtn} ${opt.isCorrect ? styles.checked : ''}`}
                                                        >
                                                            <span className="material-symbols-outlined">check</span>
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={opt.text}
                                                            onChange={e => {
                                                                const newQuestions = [...testData.questions];
                                                                newQuestions[index].options[optIndex].text = e.target.value;
                                                                setTestData({...testData, questions: newQuestions});
                                                            }}
                                                            className={styles.optionInput}
                                                            placeholder={`Вариант ${optIndex + 1}`}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newQuestions = [...testData.questions];
                                                                newQuestions[index].options = newQuestions[index].options.filter(o => o.id !== opt.id);
                                                                setTestData({...testData, questions: newQuestions});
                                                            }}
                                                            className={styles.btnRemoveOpt}
                                                        >
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => handleAddOption(q.id)} className={styles.btnAddOpt}>
                                                    <span className="material-symbols-outlined">add_circle</span>
                                                    Добавить вариант
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleAddQuestion} className={styles.btnAddQuestionDashed}>
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