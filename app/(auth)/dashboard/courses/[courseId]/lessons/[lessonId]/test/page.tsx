"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/app/components/Providers/ToastProvider';
import styles from './test.module.scss';

type Option = { id: number; text: string; };
type Question = { id: number; text: string; type: 'single' | 'multiple'; options: Option[]; };
type TestData = { id: number; title: string; passingScore: number; questions: Question[]; };

export default function TestPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    const { showToast } = useToast();

    const [testData, setTestData] = useState<TestData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number[]>>({});

    const [isFinished, setIsFinished] = useState(false);
    const [resultScore, setResultScore] = useState(0);
    const [isPassed, setIsPassed] = useState(false);

    const [isCourseCompleted, setIsCourseCompleted] = useState(false);
    const [certificateId, setCertificateId] = useState<string | null>(null);
    const [isEmailSending, setIsEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
    const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/test`);
                if (!res.ok) throw new Error("Ошибка загрузки теста");
                const data = await res.json();
                setTestData(data);
            } catch (err) {
                console.error(err);
                showToast("Не удалось загрузить тест", "error");
                router.push(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTest();
    }, [courseId, lessonId, router, showToast]);

    if (isLoading || !testData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 bg-slate-50">
                <span className="material-symbols-outlined animate-spin text-5xl mb-4">autorenew</span>
                <p className="font-medium">Подготовка вопросов...</p>
            </div>
        );
    }

    const question = testData.questions[currentStep];
    const totalQuestions = testData.questions.length;
    const progress = ((currentStep) / totalQuestions) * 100;

    const handleOptionToggle = (optionId: number) => {
        setAnswers(prev => {
            const currentAnswers = prev[question.id] || [];
            if (question.type === 'single') {
                return { ...prev, [question.id]: [optionId] };
            } else {
                if (currentAnswers.includes(optionId)) {
                    return { ...prev, [question.id]: currentAnswers.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [question.id]: [...currentAnswers, optionId] };
                }
            }
        });
    };

    const handleNext = () => {
        if (currentStep < totalQuestions - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            submitTest();
        }
    };

    const submitTest = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });

            if (!res.ok) throw new Error("Ошибка при проверке");

            const data = await res.json();
            setResultScore(data.score);
            setIsPassed(data.isPassed);
            if (data.isCourseCompleted) {
                setIsCourseCompleted(true);
                setCertificateId(data.certificateId);
            }
            setIsFinished(true);
        } catch (error) {
            showToast("Произошла ошибка при отправке результатов", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitReview = async () => {
        if (!reviewText.trim()) return;
        setIsReviewSubmitting(true);
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add_comment', text: reviewText, rating: reviewRating })
            });
            if (res.ok) {
                setIsReviewSubmitted(true);
                showToast("Спасибо за ваш отзыв!", "success");
            } else {
                throw new Error("Ошибка сервера");
            }
        } catch (error) {
            showToast("Ошибка при отправке отзыва", "error");
        } finally {
            setIsReviewSubmitting(false);
        }
    };

    const handleGetCertificate = async () => {
        if (!certificateId) return;
        setIsEmailSending(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/certificate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ certificateId })
            });
            if (res.ok) {
                setEmailSent(true);
                showToast("Сертификат успешно отправлен на вашу почту!", "success");
            } else {
                throw new Error("Ошибка сервера");
            }
        } catch (error) {
            showToast("Ошибка при запросе сертификата", "error");
        } finally {
            setIsEmailSending(false);
        }
    };

    const exitTest = () => {
        router.push(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
    };

    if (isFinished) {
        return (
            <div className={styles.resultPage}>
                <div className={styles.resultCard}>
                    <div className={`${styles.resultIcon} ${isPassed ? styles.iconSuccess : styles.iconFail}`}>
                        <span className="material-symbols-outlined">
                            {isPassed ? 'workspace_premium' : 'cancel'}
                        </span>
                    </div>

                    <div className={styles.resultText}>
                        <h2 className={styles.resultTitle}>
                            {isPassed ? 'Тест успешно сдан!' : 'Тест не пройден'}
                        </h2>
                        <p className={styles.resultDescription}>
                            Вы набрали <span className={styles.scoreHighlight}>{resultScore}%</span> правильных ответов.
                            Проходной балл: {testData.passingScore}%.
                        </p>
                    </div>

                    {isCourseCompleted && (
                        <div className={styles.certificateSection}>
                            <div className={styles.certHighlightIcon}>
                                <span className="material-symbols-outlined">workspace_premium</span>
                            </div>

                            <div className={styles.certTextContent}>
                                <h3 className={styles.certTitle}>Курс успешно завершен</h3>
                                <p className={styles.certDesc}>Ваш именной сертификат сгенерирован и добавлен в личный кабинет.</p>
                            </div>

                            <button
                                onClick={handleGetCertificate}
                                disabled={isEmailSending || emailSent}
                                className={styles.btnCertificate}
                            >
                                <span className="material-symbols-outlined">
                                    {emailSent ? 'mark_email_read' : 'mail'}
                                </span>
                                {emailSent ? 'Отправлено на email' : isEmailSending ? 'Отправка...' : 'Получить на email'}
                            </button>
                        </div>
                    )}

                    {isPassed && !isReviewSubmitted && (
                        <div className={styles.reviewSection}>
                            <h3 className={styles.reviewTitle}>Оцените курс и оставьте отзыв</h3>

                            <div className={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className={`${styles.starBtn} ${star <= reviewRating ? styles.starActive : ''}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Что вам понравилось? Что можно улучшить?"
                                className={styles.reviewTextarea}
                            />

                            <button
                                onClick={submitReview}
                                disabled={isReviewSubmitting || !reviewText.trim()}
                                className={styles.btnSubmitReview}
                            >
                                {isReviewSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                            </button>
                        </div>
                    )}

                    {isPassed && isReviewSubmitted && (
                        <div className={styles.reviewSuccess}>
                            <span className="material-symbols-outlined">check_circle</span>
                            Спасибо за ваш отзыв!
                        </div>
                    )}

                    <div className={styles.resultActions}>
                        {!isPassed && (
                            <button
                                onClick={() => { setIsFinished(false); setCurrentStep(0); setAnswers({}); }}
                                className={styles.btnRetry}
                            >
                                Попробовать снова
                            </button>
                        )}
                        <button onClick={exitTest} className={isPassed ? styles.btnRetry : styles.btnBack}>
                            Вернуться к уроку
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.testPage}>
            <header className={styles.testHeader}>
                <div className={styles.headerLeft}>
                    <button onClick={exitTest} className={styles.btnClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <span className={styles.testTitle}>{testData.title}</span>
                </div>
                <div className={styles.headerRight}>
                    Вопрос {currentStep + 1} из {totalQuestions}
                </div>
            </header>

            <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>

            <main className={styles.testMain}>
                <div className={styles.questionContainer} key={question.id}>
                    <div className={styles.questionHeader}>
                        <span className={styles.typeBadge}>
                            {question.type === 'single' ? 'Один вариант' : 'Несколько вариантов'}
                        </span>
                        <h1 className={styles.questionText}>{question.text}</h1>
                    </div>

                    <div className={styles.optionsList}>
                        {question.options.map((option) => {
                            const isSelected = (answers[question.id] || []).includes(option.id);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionToggle(option.id)}
                                    className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ''}`}
                                >
                                    <div className={`${styles.checkControl} ${question.type === 'single' ? styles.round : styles.square} ${isSelected ? styles.checked : ''}`}>
                                        {isSelected && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check</span>}
                                    </div>
                                    <span className={styles.optionLabel}>{option.text}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.footerActions}>
                        <button
                            onClick={handleNext}
                            disabled={!(answers[question.id] && answers[question.id].length > 0) || isSubmitting}
                            className={styles.btnNext}
                        >
                            {isSubmitting ? 'Проверка...' : currentStep === totalQuestions - 1 ? 'Завершить тест' : 'Следующий вопрос'}
                            {!isSubmitting && (
                                <span className="material-symbols-outlined">
                                    {currentStep === totalQuestions - 1 ? 'flag' : 'arrow_forward'}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}