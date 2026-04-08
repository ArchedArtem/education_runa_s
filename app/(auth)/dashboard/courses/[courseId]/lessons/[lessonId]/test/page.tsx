"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './test.module.scss';

const COURSE_ID = 'c-1';
const LESSON_ID = 'l-3';

const TEST_DATA = {
    title: 'Тестирование: Настройка начальных остатков',
    passingScore: 75,
    questions: [
        {
            id: 'q1',
            text: 'Какой счет используется для ввода начальных остатков в 1С:Бухгалтерия?',
            type: 'single',
            options: [
                { id: 'o1', text: 'Счет 000' },
                { id: 'o2', text: 'Счет 99.01' },
                { id: 'o3', text: 'Счет 84.01' },
                { id: 'o4', text: 'Вспомогательный счет 00' },
            ],
            correctAnswers: ['o4']
        },
        {
            id: 'q2',
            text: 'Какие из перечисленных действий нужно выполнить ДО ввода начальных остатков? (выберите несколько)',
            type: 'multiple',
            options: [
                { id: 'o1', text: 'Заполнить сведения об учетной политике' },
                { id: 'o2', text: 'Начислить амортизацию' },
                { id: 'o3', text: 'Заполнить план счетов' },
                { id: 'o4', text: 'Закрыть месяц' },
            ],
            correctAnswers: ['o1', 'o3']
        },
        {
            id: 'q3',
            text: 'Как можно убедиться в правильности ввода всех остатков?',
            type: 'single',
            options: [
                { id: 'o1', text: 'Сформировать оборотно-сальдовую ведомость' },
                { id: 'o2', text: 'Посмотреть карточку счета 51' },
                { id: 'o3', text: 'Запустить экспресс-проверку ведения учета' },
            ],
            correctAnswers: ['o1']
        }
    ]
};

export default function TestPage() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState(0);

    const question = TEST_DATA.questions[currentStep];
    const totalQuestions = TEST_DATA.questions.length;
    const progress = ((currentStep) / totalQuestions) * 100;

    const handleOptionToggle = (optionId: string) => {
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
            calculateResults();
        }
    };

    const calculateResults = () => {
        let correctCount = 0;

        TEST_DATA.questions.forEach(q => {
            const userAnswers = answers[q.id] || [];
            const isCorrect =
                userAnswers.length === q.correctAnswers.length &&
                userAnswers.every(val => q.correctAnswers.includes(val));

            if (isCorrect) correctCount++;
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        setResult(score);
        setIsFinished(true);
    };

    const exitTest = () => {
        router.push(`/dashboard/courses/${COURSE_ID}/lessons/${LESSON_ID}`);
    };

    if (isFinished) {
        const isPassed = result >= TEST_DATA.passingScore;

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
                            Вы набрали <span className={styles.scoreHighlight}>{result}%</span> правильных ответов.
                            Проходной балл: {TEST_DATA.passingScore}%.
                        </p>
                    </div>

                    <div className={styles.resultActions}>
                        {!isPassed && (
                            <button
                                onClick={() => { setIsFinished(false); setCurrentStep(0); setAnswers({}); }}
                                className={styles.btnRetry}
                            >
                                Попробовать снова
                            </button>
                        )}
                        <button
                            onClick={exitTest}
                            className={isPassed ? styles.btnRetry : styles.btnBack}
                        >
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
                    <span className={styles.testTitle}>{TEST_DATA.title}</span>
                </div>
                <div className={styles.headerRight}>
                    Вопрос {currentStep + 1} из {totalQuestions}
                </div>
            </header>

            <div className={styles.progressContainer}>
                <div
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <main className={styles.testMain}>
                <div className={styles.questionContainer} key={question.id}>

                    <div className={styles.questionHeader}>
                        <span className={styles.typeBadge}>
                            {question.type === 'single' ? 'Один вариант' : 'Несколько вариантов'}
                        </span>
                        <h1 className={styles.questionText}>
                            {question.text}
                        </h1>
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
                                    <span className={styles.optionLabel}>
                                        {option.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.footerActions}>
                        <button
                            onClick={handleNext}
                            disabled={!(answers[question.id] && answers[question.id].length > 0)}
                            className={styles.btnNext}
                        >
                            {currentStep === totalQuestions - 1 ? 'Завершить тест' : 'Следующий вопрос'}
                            <span className="material-symbols-outlined">
                                {currentStep === totalQuestions - 1 ? 'flag' : 'arrow_forward'}
                            </span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}