"use client";

import styles from './about.module.scss';

export default function AboutPage() {
    return (
        <main className={styles.pageWrapper}>
            <div className={styles.bgDecorations}>
                <div className={styles.glowBlue}></div>
                <div className={styles.glowGray}></div>
                <div className={styles.floatShape1}></div>
                <div className={styles.floatShape2}></div>
            </div>

            <div className={styles.contentContainer}>
                <section className={styles.heroSection}>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        О платформе
                    </h1>
                    <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
                        Инновационная среда дистанционного обучения, созданная специально для освоения программных продуктов 1С. Мы делаем процесс внедрения и адаптации сотрудников быстрым, понятным и эффективным.
                    </p>
                </section>

                <div className={styles.bentoGrid}>
                    <div className={styles.glassCard}>
                        <div className={styles.iconWrapper}>
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Закрытый контур</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Платформа функционирует в защищенной корпоративной среде. Доступ предоставляется абсолютно бесплатно, но исключительно действующим клиентам компании «Руна С» для качественного освоения внедряемых конфигураций.
                        </p>
                    </div>

                    <div className={styles.glassCard}>
                        <div className={styles.iconWrapper}>
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Удобный формат</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Обучайтесь в любое удобное время. Платформа предоставляет круглосуточный доступ к структурированным курсам, детализированным видеоурокам через встроенный плеер, текстовым инструкциям и дополнительным методическим материалам.
                        </p>
                    </div>

                    <div className={styles.glassCard}>
                        <div className={styles.iconWrapper}>
                            <span className="material-symbols-outlined">quiz</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Система тестирования</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Объективная проверка знаний сотрудников. Платформа включает систему промежуточных и итоговых тестирований с автоматической проверкой ответов, подсчетом баллов и сохранением подробной истории попыток в профиле.
                        </p>
                    </div>

                    <div className={styles.glassCard}>
                        <div className={styles.iconWrapper}>
                            <span className="material-symbols-outlined">monitoring</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Личный прогресс</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Информативный личный кабинет выступает в роли дашборда для управления всем процессом. Отслеживайте процент завершения активных курсов, просматривайте пройденные материалы и анализируйте результаты тестирований.
                        </p>
                    </div>
                </div>

                <div className={styles.largeCard}>
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Современные технологии и безопасность</h2>
                            <p className="text-slate-500 leading-relaxed mb-6">
                                Платформа спроектирована с упором на высокую производительность и защиту данных. Благодаря современному стеку технологий время отклика страниц сведено к минимуму. Архитектура системы гарантирует, что ваши данные, результаты тестов и обучающие материалы хранятся в строгой изоляции и недоступны по прямым ссылкам неавторизованным пользователям.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-100">Адаптивный дизайн</span>
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-100">Высокая скорость</span>
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-100">Надежность</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}