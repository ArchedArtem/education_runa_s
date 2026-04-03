"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center space-y-6">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <span className="material-symbols-outlined text-5xl">
                            {isPassed ? 'workspace_premium' : 'cancel'}
                        </span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {isPassed ? 'Тест успешно сдан!' : 'Тест не пройден'}
                        </h2>
                        <p className="text-slate-500">
                            Вы набрали <span className="font-bold text-slate-900">{result}%</span> правильных ответов.
                            Проходной балл: {TEST_DATA.passingScore}%.
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        {!isPassed && (
                            <button
                                onClick={() => { setIsFinished(false); setCurrentStep(0); setAnswers({}); }}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                            >
                                Попробовать снова
                            </button>
                        )}
                        <button
                            onClick={exitTest}
                            className={`w-full h-12 font-bold rounded-xl transition-all ${isPassed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            Вернуться к уроку
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={exitTest} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <span className="font-bold text-slate-900 truncate max-w-xs md:max-w-md">{TEST_DATA.title}</span>
                </div>
                <div className="text-sm font-bold text-slate-400">
                    Вопрос {currentStep + 1} из {totalQuestions}
                </div>
            </header>

            <div className="h-1 w-full bg-slate-200">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 py-12">
                <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" key={question.id}>

                    <div className="space-y-4">
                        <span className="inline-block px-3 py-1 bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                            {question.type === 'single' ? 'Один вариант' : 'Несколько вариантов'}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                            {question.text}
                        </h1>
                    </div>

                    <div className="space-y-3">
                        {question.options.map((option) => {
                            const isSelected = (answers[question.id] || []).includes(option.id);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionToggle(option.id)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50/50'
                                            : 'border-slate-200 bg-white hover:border-blue-300'
                                    }`}
                                >
                                    <div className={`w-6 h-6 shrink-0 flex items-center justify-center border-2 transition-colors ${
                                        question.type === 'single' ? 'rounded-full' : 'rounded-md'
                                    } ${
                                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                    }`}>
                                        {isSelected && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                    </div>
                                    <span className={`text-base font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                        {option.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button
                            onClick={handleNext}
                            disabled={!(answers[question.id] && answers[question.id].length > 0)}
                            className="h-12 px-8 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 text-white font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                        >
                            {currentStep === totalQuestions - 1 ? 'Завершить тест' : 'Следующий вопрос'}
                            <span className="material-symbols-outlined text-[20px]">
                                {currentStep === totalQuestions - 1 ? 'flag' : 'arrow_forward'}
                            </span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}