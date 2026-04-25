import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        let token: string | null = authHeader ? authHeader.split(' ')[1] : null;

        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get('auth_token')?.value || null;
        }

        if (!token) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 });
        }

        const userId = decoded.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { first_name: true, company_name: true }
        });

        if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });

        // ОБЩАЯ СТАТИСТИКА (По всей платформе)
        const totalLessonsCompleted = await prisma.userProgress.count({
            where: { user_id: userId, is_completed: true }
        });

        const userProgressList = await prisma.userProgress.findMany({
            where: { user_id: userId },
            select: { lesson: { select: { course_id: true } } }
        });
        const coursesStarted = new Set(userProgressList.map(p => p.lesson.course_id)).size;

        const testStats = await prisma.testResult.aggregate({
            where: { user_id: userId },
            _avg: { score: true }
        });

        // СТАТИСТИКА ТЕКУЩЕГО (ПОСЛЕДНЕГО) КУРСА
        const lastProgress = await prisma.userProgress.findFirst({
            where: { user_id: userId },
            orderBy: { id: 'desc' }, // Берем самую последнюю запись прогресса
            include: {
                lesson: {
                    include: { course: true }
                }
            }
        });

        let lastCourseData = null;
        if (lastProgress) {
            const courseId = lastProgress.lesson.course_id;

            // Считаем все опубликованные уроки В ЭТОМ курсе
            const courseTotalLessons = await prisma.lesson.count({
                where: { course_id: courseId, is_published: true }
            });

            // Считаем пройденные уроки В ЭТОМ курсе
            const courseCompletedLessons = await prisma.userProgress.count({
                where: {
                    user_id: userId,
                    is_completed: true,
                    lesson: { course_id: courseId }
                }
            });

            // Высчитываем точный процент
            const percentage = courseTotalLessons > 0
                ? Math.round((courseCompletedLessons / courseTotalLessons) * 100)
                : 0;

            lastCourseData = {
                courseId: courseId,
                courseTitle: lastProgress.lesson.course.title,
                courseDescription: lastProgress.lesson.course.description,
                lastLessonId: lastProgress.lesson_id,
                completedLessons: courseCompletedLessons,
                totalLessons: courseTotalLessons,
                percentage: percentage
            };
        }

        // История тестов
        const recentTests = await prisma.testResult.findMany({
            where: { user_id: userId },
            take: 5,
            orderBy: { attempt_date: 'desc' },
            include: { test: { select: { title: true } } }
        });

        return NextResponse.json({
            user,
            stats: {
                coursesStarted,
                lessonsCompleted: totalLessonsCompleted,
                avgTestScore: Math.round(testStats._avg.score || 0)
            },
            lastCourse: lastCourseData,
            recentTests: recentTests.map(rt => ({
                id: rt.id,
                testTitle: rt.test?.title || 'Удаленный тест',
                score: rt.score,
                is_passed: rt.is_passed,
                date: rt.attempt_date
            }))
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}