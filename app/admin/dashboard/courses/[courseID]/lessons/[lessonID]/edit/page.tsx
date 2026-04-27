"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './edit-lesson.module.scss';
import 'react-quill-new/dist/quill.snow.css';
import { useToast } from '@/app/components/Providers/ToastProvider';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; type: 'single' | 'multiple'; options: Option[] };
type ExistingMaterial = { id: number; name: string; url: string; type: string };

export default function EditLessonPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const [isHtmlMode, setIsHtmlMode] = useState(false);

    const courseId = (params.courseID || params.courseId || params.id) as string;
    const lessonId = (params.lessonID || params.lessonId) as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const tabParam = searchParams.get('tab') as 'main' | 'files' | 'test';
    const [activeTab, setActiveTab] = useState<'main' | 'files' | 'test'>(
        ['main', 'files', 'test'].includes(tabParam) ? tabParam : 'main'
    );

    const [lessonData, setLessonData] = useState({
        title: '',
        videoType: 'link' as 'link' | 'upload',
        videoUrl: '',
        duration: '00:00',
        content: '',
        isPublished: false,
    });

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [existingMaterials, setExistingMaterials] = useState<ExistingMaterial[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    const [testData, setTestData] = useState<{ isEnabled: boolean, passingScore: number, questions: Question[] }>({
        isEnabled: false,
        passingScore: 80,
        questions: []
    });

    const videoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`);
                if (!res.ok) throw new Error('Ошибка загрузки урока');
                const data = await res.json();

                setLessonData({
                    title: data.title || '',
                    videoType: 'link',
                    videoUrl: data.video_url || '',
                    duration: data.duration || '00:00',
                    content: data.content || '',
                    isPublished: data.is_published || false,
                });

                if (data.materials) {
                    setExistingMaterials(data.materials.map((m: any) => ({
                        id: m.id,
                        name: m.file_name,
                        url: m.file_url,
                        type: m.file_type
                    })));
                }

                if (data.test) {
                    setTestData({
                        isEnabled: true,
                        passingScore: data.test.passing_score,
                        questions: data.test.questions.map((q: any) => ({
                            id: `q-${q.id}`,
                            text: q.question_text,
                            type: q.question_type,
                            options: q.answers.map((a: any) => ({
                                id: `opt-${a.id}`,
                                text: a.answer_text,
                                isCorrect: a.is_correct
                            }))
                        }))
                    });
                }
            } catch (err) {
                console.error(err);
                showToast('Не удалось загрузить данные урока', 'error');
                router.push(`/admin/dashboard/courses/${courseId}/lessons`);
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) fetchLesson();
    }, [courseId, lessonId, router, showToast]);

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const removeExistingMaterial = (id: number) => {
        setExistingMaterials(prev => prev.filter(m => m.id !== id));
    };

    const removeNewFile = (indexToRemove: number) => {
        setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: `q-${Date.now()}`, text: '', type: 'single',
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
            questions: prev.questions.map(q => q.id === questionId
                ? { ...q, options: [...q.options, { id: `opt-${Date.now()}`, text: '', isCorrect: false }] }
                : q
            )
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
            showToast('Добавьте хотя бы один вопрос в тест.', 'warning');
            setActiveTab('test');
            return;
        }

        setIsSaving(true);
        let finalVideoUrl = lessonData.videoUrl;
        const finalMaterials = [...existingMaterials];

        try {
            if (lessonData.videoType === 'upload' && videoFile) {
                const fd = new FormData();
                fd.append('file', videoFile);
                const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                if (!res.ok) throw new Error('Ошибка загрузки видео');
                finalVideoUrl = (await res.json()).url;
            }

            for (const file of newFiles) {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                if (!res.ok) throw new Error(`Ошибка загрузки ${file.name}`);
                const data = await res.json();
                finalMaterials.push({ id: 0, name: file.name, url: data.url, type: file.name.split('.').pop() || 'unknown' });
            }

            const payload = {
                title: lessonData.title,
                content: lessonData.content,
                video_url: finalVideoUrl,
                duration: lessonData.duration,
                is_published: lessonData.isPublished,
                materials: finalMaterials,
                test: testData.isEnabled ? {
                    isEnabled: true,
                    passing_score: testData.passingScore,
                    questions: testData.questions.map(q => ({
                        question_text: q.text,
                        question_type: q.type,
                        answers: q.options.map(opt => ({ answer_text: opt.text, is_correct: opt.isCorrect }))
                    }))
                } : null
            };

            const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Ошибка при сохранении урока.');

            showToast('Изменения успешно сохранены!', 'success');
            router.push(`/admin/dashboard/courses/${courseId}/lessons`);

        } catch (err) {
            console.error(err);
            showToast('Произошла ошибка при сохранении урока.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={`${styles.container} flex items-center justify-center min-h-[50vh]`}>
                <div className="flex flex-col items-center text-slate-400 gap-3">
                    <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
                    <p className="font-medium">Загрузка данных урока...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <section className={styles.stickyHeader}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.pageTitle}>Редактирование урока</h1>
                </div>

                <div className={styles.headerActions}>
                    <button onClick={() => router.back()} className={styles.btnSecondary}>Отмена</button>
                    <button onClick={handleSave} disabled={isSaving || isGeneratingAI} className={styles.btnPrimary}>
                        <span className={`material-symbols-outlined ${isSaving ? styles.spinIcon : ''}`}>
                            {isSaving ? 'autorenew' : 'save'}
                        </span>
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
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
                        {(existingMaterials.length + newFiles.length) > 0 && <span className={styles.badge}>{existingMaterials.length + newFiles.length}</span>}
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
                                <input type="text" value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})} className={styles.textInput} placeholder="Например: Введение в интерфейс 1С"/>
                            </div>

                            <div className={styles.videoSection}>
                                <div className={styles.videoHeader}>
                                    <label className={styles.label}>Видео к уроку</label>
                                    <div className={styles.toggleGroup}>
                                        <button onClick={() => setLessonData({...lessonData, videoType: 'link'})} className={`${styles.toggleBtn} ${lessonData.videoType === 'link' ? styles.toggleActive : ''}`}>По ссылке</button>
                                        <button onClick={() => setLessonData({...lessonData, videoType: 'upload'})} className={`${styles.toggleBtn} ${lessonData.videoType === 'upload' ? styles.toggleActive : ''}`}>Свой файл</button>
                                    </div>
                                </div>

                                {lessonData.videoType === 'link' ? (
                                    <div className={styles.inputWithIcon}>
                                        <span className="material-symbols-outlined">link</span>
                                        <input type="url" value={lessonData.videoUrl} onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})} className={styles.textInput} placeholder="https://youtube.com/..."/>
                                    </div>
                                ) : (
                                    <div className={styles.uploadBox} onClick={() => videoInputRef.current?.click()}>
                                        <span className="material-symbols-outlined">video_library</span>
                                        <p className={styles.uploadTitle}>{videoFile ? videoFile.name : 'Выбрать новое видео'}</p>
                                        <p className={styles.uploadHint}>{videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'MP4, WebM (до 2 ГБ)'}</p>
                                        <input type="file" accept="video/mp4, video/webm" className={styles.hiddenInput} ref={videoInputRef} onChange={handleVideoSelect} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                                <label className={styles.label}>Длительность (ММ:СС)</label>
                                <input type="text" className={styles.textInput} style={{ maxWidth: '120px' }} value={lessonData.duration} onChange={e => setLessonData({...lessonData, duration: e.target.value})} />
                            </div>

                            <div className={styles.editorSection}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className={styles.label} style={{ marginBottom: 0 }}>Текстовый конспект</label>

                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setIsHtmlMode(false)}
                                            className={`flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isHtmlMode ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                                            Визуальный
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsHtmlMode(true)}
                                            className={`flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isHtmlMode ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px] mr-1">code</span>
                                            HTML
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.quillWrapper}>
                                    {isHtmlMode ? (
                                        <textarea
                                            value={lessonData.content}
                                            onChange={e => setLessonData({...lessonData, content: e.target.value})}
                                            className="w-full min-h-[300px] p-4 font-mono text-sm rounded-b-lg outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                            style={{
                                                backgroundColor: '#1e1e1e',
                                                color: '#d4d4d4',
                                                caretColor: '#ffffff',
                                                border: '1px solid #e2e8f0'
                                            }}
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
                            <h3 className={styles.cardTitle}>Настройки публикации</h3>
                            <label className={styles.switchWrapper}>
                                <div className={`${styles.switchTrack} ${lessonData.isPublished ? styles.switchOn : ''}`}><div className={styles.switchThumb}></div></div>
                                <div className={styles.switchLabels}>
                                    <span className={styles.switchMain}>Опубликовать урок</span>
                                </div>
                                <input type="checkbox" className={styles.hiddenInput} checked={lessonData.isPublished} onChange={e => setLessonData({...lessonData, isPublished: e.target.checked})} />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'files' && (
                <div className={styles.card}>
                    <div className={styles.filesContent}>
                        <div className={styles.uploadBoxLarge} onClick={() => fileInputRef.current?.click()}>
                            <div className={styles.uploadCircle}><span className="material-symbols-outlined">cloud_upload</span></div>
                            <h3 className={styles.uploadTitleLarge}>Загрузить материалы</h3>
                            <input type="file" multiple className={styles.hiddenInput} ref={fileInputRef} onChange={handleFilesSelect} />
                        </div>

                        {existingMaterials.length > 0 && (
                            <div className="mt-8 space-y-3 max-w-3xl mx-auto w-full">
                                <h3 className="font-bold text-slate-900">Текущие файлы</h3>
                                {existingMaterials.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined">description</span></div>
                                            <p className="font-bold text-sm text-slate-900">{file.name}</p>
                                        </div>
                                        <button onClick={() => removeExistingMaterial(file.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {newFiles.length > 0 && (
                            <div className="mt-4 space-y-3 max-w-3xl mx-auto w-full">
                                <h3 className="font-bold text-slate-900">Новые файлы к загрузке</h3>
                                {newFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-xl hover:border-green-300 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined">upload_file</span></div>
                                            <p className="font-bold text-sm text-slate-900">{file.name}</p>
                                        </div>
                                        <button onClick={() => removeNewFile(index)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined">close</span>
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
                                <div className={`${styles.switchTrack} ${testData.isEnabled ? styles.switchOnTest : ''}`}><div className={styles.switchThumb}></div></div>
                                <input type="checkbox" className={styles.hiddenInput} checked={testData.isEnabled} onChange={e => setTestData({...testData, isEnabled: e.target.checked})} />
                            </label>
                            <div className={styles.testTitleInfo}>
                                <h3 className={styles.cardTitleInline}>Тестирование после урока</h3>
                                <p className={styles.switchSub}>Обязателен для завершения урока</p>
                            </div>
                        </div>

                        {testData.isEnabled && (
                            <div className={styles.scoreInputGroup}>
                                <label>Проходной балл (%):</label>
                                <input type="number" value={testData.passingScore} min={0} max={100} onChange={e => setTestData({...testData, passingScore: Number(e.target.value)})} className={styles.scoreInput} />
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
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                                            <button onClick={() => setTestData(prev => ({...prev, questions: prev.questions.filter(quest => quest.id !== q.id)}))} className={styles.btnDeleteQuestion}>
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>

                                            <div className={styles.questionHeader}>
                                                <div className={styles.qNumber}>{index + 1}</div>
                                                <div className={styles.qInputs}>
                                                    <input type="text" value={q.text} onChange={e => { const newQ = [...testData.questions]; newQ[index].text = e.target.value; setTestData({...testData, questions: newQ}); }} className={styles.qTitleInput} placeholder="Текст вопроса..." />
                                                    <div className={styles.qTypeGroup}>
                                                        <label className={styles.radioLabel}><input type="radio" checked={q.type === 'single'} onChange={() => { const newQ = [...testData.questions]; newQ[index].type = 'single'; setTestData({...testData, questions: newQ}); }} /> Один вариант</label>
                                                        <label className={styles.radioLabel}><input type="radio" checked={q.type === 'multiple'} onChange={() => { const newQ = [...testData.questions]; newQ[index].type = 'multiple'; setTestData({...testData, questions: newQ}); }} /> Несколько</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.optionsList}>
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={opt.id} className={`${styles.optionItem} ${opt.isCorrect ? styles.optionCorrect : ''}`}>
                                                        <button onClick={() => { const newQ = [...testData.questions]; if (q.type === 'single') newQ[index].options.forEach(o => o.isCorrect = false); newQ[index].options[optIndex].isCorrect = !opt.isCorrect; setTestData({...testData, questions: newQ}); }} className={`${styles.checkBtn} ${opt.isCorrect ? styles.checked : ''}`}>
                                                            <span className="material-symbols-outlined">check</span>
                                                        </button>
                                                        <input type="text" value={opt.text} onChange={e => { const newQ = [...testData.questions]; newQ[index].options[optIndex].text = e.target.value; setTestData({...testData, questions: newQ}); }} className={styles.optionInput} placeholder={`Вариант ${optIndex + 1}`} />
                                                        <button onClick={() => { const newQ = [...testData.questions]; newQ[index].options = newQ[index].options.filter(o => o.id !== opt.id); setTestData({...testData, questions: newQ}); }} className={styles.btnRemoveOpt}>
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => handleAddOption(q.id)} className={styles.btnAddOpt}><span className="material-symbols-outlined">add_circle</span> Добавить вариант</button>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', marginTop: '1rem', gap: '1rem' }}>
                                        <button onClick={handleAddQuestion} className={styles.btnAddQuestionDashed} style={{ flex: 1 }}>
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