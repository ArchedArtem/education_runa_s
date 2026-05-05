"use client";

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './new-lesson.module.scss';
import 'react-quill-new/dist/quill.snow.css';
import { useToast } from '@/app/components/Providers/ToastProvider';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const INITIAL_LESSON = {
    title: '',
    videoType: 'link' as 'link' | 'upload',
    videoUrl: '',
    duration: '00:00',
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
    const { showToast } = useToast();

    const [isHtmlMode, setIsHtmlMode] = useState(false);

    const [activeTab, setActiveTab] = useState<'main' | 'files' | 'test'>('main');
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const [lessonData, setLessonData] = useState(INITIAL_LESSON);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);

    const [testData, setTestData] = useState<{isEnabled: boolean, passingScore: number, questions: Question[]}>(INITIAL_TEST);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
        }
    };

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

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

    const handleGenerateAITest = async () => {
        if (!lessonData.content || lessonData.content.trim() === '' || lessonData.content === '<p><br></p>') {
            showToast('Сначала заполните текстовый конспект урока!', 'warning');
            return;
        }

        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/admin/ai/generate-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: lessonData.content })
            });

            if (!res.ok) throw new Error('Ошибка генерации');

            const data = await res.json();

            const generatedQuestions = data.questions.map((q: any) => ({
                id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                text: q.text,
                type: q.type,
                options: q.options.map((opt: any) => ({
                    id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: opt.text,
                    isCorrect: opt.isCorrect
                }))
            }));

            setTestData(prev => ({
                ...prev,
                isEnabled: true,
                questions: [...prev.questions, ...generatedQuestions]
            }));

            showToast('ИИ успешно сгенерировал тест!', 'success');
        } catch (error) {
            showToast('Ошибка при генерации теста ИИ', 'error');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSave = async () => {
        if (!lessonData.title.trim()) {
            showToast('Пожалуйста, введите название урока!', 'warning');
            setActiveTab('main');
            return;
        }

        if (testData.isEnabled && testData.questions.length === 0) {
            showToast('Вы включили тест, но не добавили ни одного вопроса.', 'warning');
            setActiveTab('test');
            return;
        }

        setIsSaving(true);
        let finalVideoUrl = lessonData.videoUrl;
        const uploadedMaterials: { name: string, url: string, type: string }[] = [];

        try {
            if (lessonData.videoType === 'upload' && videoFile) {
                const formData = new FormData();
                formData.append('file', videoFile);
                const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                if (!uploadRes.ok) throw new Error('Ошибка загрузки видео');
                const uploadData = await uploadRes.json();
                finalVideoUrl = uploadData.url;
            }

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                if (!uploadRes.ok) throw new Error(`Ошибка загрузки файла ${file.name}`);
                const uploadData = await uploadRes.json();

                uploadedMaterials.push({
                    name: file.name,
                    url: uploadData.url,
                    type: file.name.split('.').pop() || 'unknown'
                });
            }

            const payload = {
                title: lessonData.title,
                content: lessonData.content,
                video_url: lessonData.videoType === 'upload' ? finalVideoUrl : lessonData.videoUrl,
                duration: lessonData.duration || '00:00',
                is_published: lessonData.isPublished,
                materials: uploadedMaterials,
                test: testData.isEnabled ? {
                    passing_score: testData.passingScore,
                    questions: testData.questions.map(q => ({
                        question_text: q.text,
                        question_type: q.type,
                        answers: q.options.map(opt => ({
                            answer_text: opt.text,
                            is_correct: opt.isCorrect
                        }))
                    }))
                } : null
            };

            const response = await fetch(`/api/admin/courses/${courseId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Ошибка при сохранении урока.');

            showToast('Новый урок успешно создан!', 'success');
            router.push(`/admin/dashboard/courses/${courseId}/lessons`);

        } catch (err) {
            showToast('Произошла ошибка при сохранении урока.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <section className={styles.stickyHeader}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.pageTitle}>Создание нового урока</h1>
                    <p className={styles.pageSubtitle}>Добавьте контент, прикрепите файлы и настройте тест.</p>
                </div>

                <div className={styles.headerActions}>
                    <button onClick={() => router.back()} className={styles.btnSecondary}>
                        Отмена
                    </button>
                    <button onClick={handleSave} disabled={isSaving || isGeneratingAI} className={styles.btnPrimary}>
                        <span className={`material-symbols-outlined ${isSaving ? styles.spinIcon : ''}`}>
                            {isSaving ? 'autorenew' : 'add_circle'}
                        </span>
                        {isSaving ? 'Сохранение...' : 'Создать урок'}
                    </button>
                </div>
            </section>

            <section className={styles.tabsNav}>
                <div className={styles.tabsList}>
                    <button onClick={() => setActiveTab('main')} className={`${styles.tabItem} ${activeTab === 'main' ? styles.tabActive : ''}`}>
                        <span className="material-symbols-outlined">article</span>
                        <span className={styles.tabText}>Контент</span>
                    </button>
                    <button onClick={() => setActiveTab('files')} className={`${styles.tabItem} ${activeTab === 'files' ? styles.tabActive : ''}`}>
                        <span className="material-symbols-outlined">attach_file</span>
                        <span className={styles.tabText}>Материалы</span>
                        {files.length > 0 && <span className={styles.badge}>{files.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('test')} className={`${styles.tabItem} ${activeTab === 'test' ? styles.tabActive : ''}`}>
                        <span className="material-symbols-outlined">quiz</span>
                        <span className={styles.tabText}>Тест</span>
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
                                    placeholder="Например: Введение в интерфейс 1С"
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
                                    <div
                                        className={styles.uploadBox}
                                        onClick={() => videoInputRef.current?.click()}
                                    >
                                        <span className="material-symbols-outlined">video_library</span>
                                        <p className={styles.uploadTitle}>
                                            {videoFile ? videoFile.name : 'Загрузить видеофайл'}
                                        </p>
                                        <p className={styles.uploadHint}>
                                            {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'MP4, WebM (до 2 ГБ)'}
                                        </p>
                                        <button className={styles.btnSmall}>
                                            {videoFile ? 'Заменить видео' : 'Выбрать видео'}
                                        </button>
                                        <input
                                            type="file"
                                            accept="video/mp4, video/webm"
                                            className={styles.hiddenInput}
                                            ref={videoInputRef}
                                            onChange={handleVideoSelect}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                                <label className={styles.label}>Длительность (ММ:СС)</label>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    style={{ maxWidth: '120px' }}
                                    value={lessonData.duration}
                                    onChange={e => setLessonData({...lessonData, duration: e.target.value})}
                                />
                            </div>

                            <div className={styles.editorSection}>
                                <div className={styles.editorHeader}>
                                    <label className={styles.label} style={{ marginBottom: 0 }}>Текстовый конспект</label>

                                    <div className={styles.editorToggleGroup}>
                                        <button
                                            type="button"
                                            onClick={() => setIsHtmlMode(false)}
                                            className={`${styles.editorToggleBtn} ${!isHtmlMode ? styles.active : ''}`}
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                            Визуальный
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsHtmlMode(true)}
                                            className={`${styles.editorToggleBtn} ${isHtmlMode ? styles.active : ''}`}
                                        >
                                            <span className="material-symbols-outlined">code</span>
                                            HTML
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.quillWrapper}>
                                    {isHtmlMode ? (
                                        <textarea
                                            value={lessonData.content}
                                            onChange={e => setLessonData({...lessonData, content: e.target.value})}
                                            className={styles.htmlTextarea}
                                            placeholder="<h1>Вставьте свой HTML код сюда...</h1>"
                                        />
                                    ) : (
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
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideCol}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Публикация</h3>
                            <label className={styles.switchWrapper}>
                                <div className={`${styles.switchTrack} ${lessonData.isPublished ? styles.switchOn : ''}`}>
                                    <div className={styles.switchThumb}></div>
                                </div>
                                <div className={styles.switchLabels}>
                                    <span className={styles.switchMain}>Опубликовать сразу</span>
                                    <span className={styles.switchSub}>Будет виден клиентам</span>
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
                        <div
                            className={styles.uploadBoxLarge}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.uploadCircle}>
                                <span className="material-symbols-outlined">cloud_upload</span>
                            </div>
                            <h3 className={styles.uploadTitleLarge}>Загрузить материалы</h3>
                            <p className={styles.uploadSubtitle}>PDF, DOCX, XLSX и другие</p>
                            <button className={styles.btnGhost}>Выбрать файлы</button>
                            <input
                                type="file"
                                multiple
                                className={styles.hiddenInput}
                                ref={fileInputRef}
                                onChange={handleFilesSelect}
                            />
                        </div>

                        {files.length > 0 && (
                            <div className={styles.filesListWrapper}>
                                <h3>Прикрепленные файлы</h3>
                                {files.map((file, index) => (
                                    <div key={index} className={styles.fileItem}>
                                        <div className={styles.fileInfo}>
                                            <div className={styles.fileIcon}>
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <div className={styles.fileText}>
                                                <p className={styles.fileName}>{file.name}</p>
                                                <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className={styles.fileRemoveBtn}
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
                                <h3 className={styles.cardTitleInline}>Включить тест к уроку</h3>
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
                                    <p>Создайте первый вопрос для проверки знаний или доверьте это ИИ</p>
                                    <div className={styles.emptyStateActions}>
                                        <button onClick={handleAddQuestion} className={styles.btnAmber}>
                                            <span className="material-symbols-outlined">add</span>
                                            Добавить вручную
                                        </button>
                                        <button onClick={handleGenerateAITest} disabled={isGeneratingAI} className={styles.btnAI}>
                                            <span className={`material-symbols-outlined ${isGeneratingAI ? styles.spinIcon : ''}`}>
                                                {isGeneratingAI ? 'autorenew' : 'auto_awesome'}
                                            </span>
                                            {isGeneratingAI ? 'Генерация ИИ...' : 'Сгенерировать ИИ'}
                                        </button>
                                    </div>
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
                                    <div className={styles.addActionsRow}>
                                        <button onClick={handleAddQuestion} className={styles.btnAddQuestionDashed}>
                                            <span className="material-symbols-outlined">add</span>
                                            Добавить следующий
                                        </button>
                                        <button onClick={handleGenerateAITest} disabled={isGeneratingAI} className={styles.btnAIsmall}>
                                            <span className={`material-symbols-outlined ${isGeneratingAI ? styles.spinIcon : ''}`}>
                                                {isGeneratingAI ? 'autorenew' : 'auto_awesome'}
                                            </span>
                                            Сгенерировать ИИ
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}