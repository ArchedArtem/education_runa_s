import styles from './HeroSection.module.scss';

export default function HeroSection() {
    return (
        <section className={styles.section}>
            <div className={styles.textContent}>
                <div className="space-y-4">
                    <h1 className={styles.title}>
                        Обучение <span>1С</span>
                    </h1>
                    <p className={styles.description}>
                        Закрытая образовательная платформа для клиентов компании. Профессиональный рост и экспертные знания.
                    </p>
                </div>
                <button className={styles.startBtn}>
                    Начать обучение
                </button>
            </div>

            <div className={styles.mockupWrapper}>
                <div className={styles.mockupGlow}></div>
                <div className={styles.mockupCard}>

                    <div className={styles.mockupBody}>
                        <div className="flex-1 space-y-4">
                            <div className="aspect-video bg-slate-800 rounded-xl relative flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                    <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                                </div>
                            </div>
                            <div className="h-4 w-32 bg-slate-200 rounded"></div>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 rounded"></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}