import styles from './FeaturesBento.module.scss';

export default function FeaturesBento() {
    return (
        <section className={styles.section}>
            <div className={styles.grid}>
                <div className={`${styles.card} ${styles.cardVideo}`}>
                    <div className={styles.iconBox} style={{ backgroundColor: '#dce1ff', color: '#0037b0' }}>
                        <span className="material-symbols-outlined text-3xl md:text-4xl">video_library</span>
                    </div>
                    <div>
                        <h3 className={styles.title}>Видеоуроки по продуктам 1С</h3>
                        <p className={styles.descriptionVideo}>
                            Библиотека профессиональных видеоинструкций, обновляемая экспертами по мере выхода новых релизов программного обеспечения.
                        </p>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardAnalytics}`}>
                    <div className={styles.iconBox} style={{ backgroundColor: '#d5e3fc', color: '#515f74' }}>
                        <span className="material-symbols-outlined text-3xl md:text-4xl">analytics</span>
                    </div>
                    <div>
                        <h3 className={styles.titleSmall}>Отслеживание прогресса</h3>
                        <p className={styles.description}>
                            Ваша личная статистика и история обучения в реальном времени.
                        </p>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardQuiz}`}>
                    <div className={styles.quizContent}>
                        <div className={styles.iconBox} style={{ backgroundColor: '#ffdad6', color: '#8f000a' }}>
                            <span className="material-symbols-outlined text-3xl md:text-4xl">quiz</span>
                        </div>
                        <div>
                            <h3 className={styles.title}>Тестирование знаний</h3>
                            <p className={styles.description}>
                                Проверка квалификации после каждого модуля с автоматической выдачей подтверждений о прохождении курса.
                            </p>
                        </div>
                    </div>
                    <div className={styles.quizMockup}>
                        <div className="text-[0.65rem] md:text-xs font-bold text-slate-400 mb-3 md:mb-4 uppercase tracking-widest">Тест: Основы бухгалтерии</div>
                        <div className="space-y-2 md:space-y-3">
                            <div className="p-2 md:p-3 bg-white rounded-lg border border-blue-200 flex items-center gap-2 md:gap-3">
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 md:border-4 border-blue-700 flex-shrink-0"></div>
                                <span className="text-xs md:text-sm font-medium">Актив баланса отражает...</span>
                            </div>
                            <div className="p-2 md:p-3 bg-white rounded-lg border border-transparent flex items-center gap-2 md:gap-3">
                                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-slate-300 flex-shrink-0"></div>
                                <span className="text-xs md:text-sm font-medium">Пассив баланса — это...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}