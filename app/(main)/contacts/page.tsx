import styles from './page.module.scss';

export default function ContactsPage() {
    const phoneContacts = [
        { icon: 'call', label: 'Горячая линия', number: '+7 929-044-73-03' },
        { icon: 'support_agent', label: 'Менеджер', number: '+7 929-044-73-39' },
        { icon: 'payments', label: 'Продажи', number: '+7 963-232-82-23' }
    ];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.bgDecorations}>
                <div className={styles.glowBlue}></div>
                <div className={styles.glowGray}></div>
                <div className={styles.floatShape1}></div>
                <div className={styles.floatShape2}></div>
            </div>

            <main className={styles.contentContainer}>
                <section className={styles.heroSection}>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 text-slate-900">
                        Контакты
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-500 font-light">
                        Служба поддержки и отдел заботы о клиентах
                    </p>
                </section>

                <div className={styles.addressCardLarge}>
                    <div className={styles.addressInfo}>
                        <div className={styles.iconWrapper}>
                            <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">Адрес</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-sm">
                            г. Нижний Новгород, ул. Нестерова, д. 9, оф. 804
                        </p>
                    </div>

                    <div className={styles.mapContainer}>
                        <iframe
                            src="https://yandex.ru/map-widget/v1/?um=constructor%3A90d25dde2015349782cdb8cf7c099f6be5e1b8dab792cee46e10dcb7e92b09c2&amp;source=constructor"
                            width="100%" height="100%" frameBorder="0"></iframe>
                    </div>
                </div>

                <div className={styles.bentoGrid}>
                    <div className={styles.glassCard}>
                        <div className={styles.iconWrapper}>
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">E-mail</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            runa_post@mail.ru
                        </p>
                    </div>

                    <div className={styles.glassCard}>
                        <div className={styles.iconWrapper}>
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">Время работы</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            Пн - Пт, с 9:00 до 18:00 (мск)
                        </p>
                    </div>
                </div>

                <div className={styles.largeCard}>
                    <h3 className="text-2xl font-bold mb-6 text-slate-900">Телефоны</h3>
                    <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-16">
                        {phoneContacts.map((contact, index) => (
                            <div key={index} className={styles.phoneItem}>
                                <span className={`material-symbols-outlined ${styles.icon}`}>
                                    {contact.icon}
                                </span>
                                <div className="flex flex-col">
                                    <span className={styles.label}>{contact.label}</span>
                                    <span className={styles.number}>{contact.number}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}