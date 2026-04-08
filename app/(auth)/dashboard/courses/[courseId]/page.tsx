"use client";

import Link from 'next/link';
import styles from './course.module.scss';

const MOCK_COURSE_DETAILS = {
    id: 1,
    title: 'Ведение учета в 1С:Бухгалтерия 8.3',
    description: 'Полный курс по освоению "1С:Бухгалтерия 8.3". Вы научитесь настраивать параметры учета, вводить начальные остатки, работать с банковскими выписками, начислять зарплату и формировать регламентированную отчетность.',
    software_product: '1С:Бухгалтерия',
    thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000',
    authors: 'Методический отдел Руна С',
    lessons: [
        { id: 101, title: 'Введение. Настройка параметров учета', is_completed: true },
        { id: 102, title: 'Ввод начальных остатков по счетам', is_completed: true },
        { id: 103, title: 'Учет кассовых операций', is_completed: false },
        { id: 104, title: 'Банковские выписки и платежные поручения', is_completed: false },
        { id: 105, title: 'Покупка и продажа товаров. Счета-фактуры', is_completed: false },
        { id: 106, title: 'Закрытие месяца и формирование баланса', is_completed: false },
    ]
};

export default function CourseOverviewPage() {
    const course = MOCK_COURSE_DETAILS;

    const totalLessons = course.lessons.length;
    const completedCount = course.lessons.filter(l => l.is_completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isAllLessonsCompleted = completedCount === totalLessons && totalLessons > 0;

    return (
        <div className={styles.pageContainer}>

            <section
                className={styles.heroBanner}
                style={{ backgroundImage: `url(${course.thumbnail_url})` }}
            >
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.productTag}>
                        <div className={styles.dot}></div>
                        {course.software_product}
                    </div>
                    <h1 className={styles.courseTitle}>
                        {course.title}
                    </h1>
                    <div className={styles.authorsInfo}>
                        <span className="material-symbols-outlined">group</span>
                        Авторы: {course.authors}
                    </div>
                </div>
            </section>

            <div className={styles.mainGrid}>

                <div className={styles.contentCol}>
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>Детальное описание курса</h2>
                        <p className={styles.descriptionText}>
                            {course.description}
                        </p>
                    </section>

                    <section className={styles.sectionCard}>
                        <div className={styles.programHeader}>
                            <h2 className={styles.sectionTitle} style={{marginBottom: 0}}>Программа</h2>
                            <span className={styles.countBadge}>
                                {completedCount} / {totalLessons} пройдено
                            </span>
                        </div>

                        <div className={styles.lessonList}>
                            {course.lessons.map((lesson, index) => (
                                <Link
                                    href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                                    key={lesson.id}
                                    className={`${styles.lessonItem} ${lesson.is_completed ? styles.lessonCompleted : styles.lessonNotCompleted}`}
                                >
                                    <div className={styles.lessonInfo}>
                                        <div className={`${styles.statusIcon} ${lesson.is_completed ? styles.iconCompleted : styles.iconNotCompleted}`}>
                                            <span className="material-symbols-outlined">
                                                {lesson.is_completed ? 'check' : 'play_arrow'}
                                            </span>
                                        </div>
                                        <div className={styles.lessonText}>
                                            <span className={styles.lessonIndex}>Урок {index + 1}</span>
                                            <h4 className={styles.lessonTitle}>
                                                {lesson.title}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className={`${styles.lessonStatusLabel} ${lesson.is_completed ? styles.textGreen : styles.textBlue}`}>
                                        {lesson.is_completed ? 'Пройдено' : 'Не пройдено'}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <div className={styles.sidebarCol}>
                    <div className={styles.progressCard}>
                        <h3 className={styles.sectionTitle} style={{fontSize: '1.125rem'}}>Ваш прогресс</h3>

                        <div className={styles.progressInfo}>
                            <span className={styles.label}>Освоено</span>
                            <span className={styles.value}>{progressPercentage}%</span>
                        </div>
                        <div className={styles.progressBarContainer}>
                            <div
                                className={styles.progressBarFill}
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <Link
                            href={`/dashboard/courses/${course.id}/lessons/${course.lessons.find(l => !l.is_completed)?.id || course.lessons[0].id}`}
                            className={styles.btnAction}
                        >
                            <span className="material-symbols-outlined">play_circle</span>
                            {completedCount > 0 && completedCount < totalLessons ? 'Продолжить обучение' :
                                completedCount === totalLessons ? 'Повторить материалы' : 'Начать обучение'}
                        </Link>
                    </div>

                    <div className={`${styles.testCard} ${isAllLessonsCompleted ? styles.testUnlocked : styles.testLocked}`}>
                        <div className={styles.testHeader}>
                            <div className={`${styles.testIconBox} ${isAllLessonsCompleted ? styles.testIconUnlocked : styles.testIconLocked}`}>
                                <span className="material-symbols-outlined">quiz</span>
                            </div>
                            <h4 className={`${styles.testTitle} ${isAllLessonsCompleted ? styles.testTitleUnlocked : styles.testTitleLocked}`}>
                                Итоговый тест
                            </h4>
                        </div>

                        <p className={`${styles.testDescription} ${isAllLessonsCompleted ? styles.testDescUnlocked : styles.testDescLocked}`}>
                            {isAllLessonsCompleted
                                ? 'Все уроки пройдены! Подтвердите свои знания, чтобы завершить курс.'
                                : 'Тест будет доступен после завершения всех уроков программы.'}
                        </p>

                        {isAllLessonsCompleted ? (
                            <Link
                                href={`/dashboard/courses/${course.id}/test`}
                                className={styles.btnTest}
                            >
                                <span className="material-symbols-outlined">check_circle</span>
                                Сдать тест
                            </Link>
                        ) : (
                            <div className={styles.btnLocked}>
                                <span className="material-symbols-outlined">lock</span>
                                Тест заблокирован
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}