import styles from './FeaturesBento.module.scss';

export default function FeaturesBento() {
    return (
        <section className={styles.section}>
            <div className={styles.grid}>
                <div className={`${styles.card} ${styles.cardVideo}`}>
                    <div className={styles.iconBox} style={{ backgroundColor: '#dce1ff', color: '#0037b0' }}>
                        <span className="material-symbols-outlined text-4xl">video_library</span>
                    </div>
                    <div>
                        <h3 className={styles.title}>Видеоуроки по продуктам 1С</h3>
                        <p className={styles.description} style={{ maxWidth: '32rem' }}>
                            Библиотека профессиональных видеоинструкций, обновляемая экспертами по мере выхода новых релизов программного обеспечения.
                        </p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconBox} style={{ backgroundColor: '#d5e3fc', color: '#515f74' }}>
                        <span className="material-symbols-outlined text-4xl">analytics</span>
                    </div>
                    <div>
                        <h3 className={styles.title} style={{ fontSize: '1.25rem' }}>Отслеживание прогресса</h3>
                        <p className={styles.description}>
                            Ваша личная статистика и история обучения в реальном времени.
                        </p>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardQuiz}`}>
                    <div className="flex-1 space-y-4">
                        <div className={styles.iconBox} style={{ backgroundColor: '#ffdad6', color: '#8f000a' }}>
                            <span className="material-symbols-outlined text-4xl">quiz</span>
                        </div>
                        <div>
                            <h3 className={styles.title}>Тестирование знаний</h3>
                            <p className={styles.description}>
                                Проверка квалификации после каждого модуля с автоматической выдачей подтверждений о прохождении курса.
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 w-full md:w-auto bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Тест: Основы бухгалтерии</div>
                        <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border border-blue-200 flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-4 border-blue-700"></div>
                                <span className="text-sm font-medium">Актив баланса отражает...</span>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-transparent flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                                <span className="text-sm font-medium">Пассив баланса — это...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}