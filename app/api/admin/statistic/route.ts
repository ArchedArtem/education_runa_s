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

        if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 });
        }

        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                lessons: {
                    select: {
                        progress: { select: { is_completed: true } }
                    }
                }
            }
        });

        const courseStats = courses.map(course => {
            let totalStarted = 0;
            let totalCompleted = 0;

            course.lessons.forEach(lesson => {
                totalStarted += lesson.progress.length;
                totalCompleted += lesson.progress.filter(p => p.is_completed).length;
            });

            return {
                id: course.id,
                title: course.title,
                views: totalStarted,
                completionRate: totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0
            };
        }).sort((a, b) => b.views - a.views); // Сортируем по популярности

        const totalUsers = await prisma.user.count();
        const testResults = await prisma.testResult.findMany({ select: { is_passed: true, score: true } });

        const passedTestsCount = testResults.filter(t => t.is_passed).length;
        const passRate = testResults.length > 0 ? Math.round((passedTestsCount / testResults.length) * 100) : 0;
        const avgScore = testResults.length > 0 ? Math.round(testResults.reduce((acc, curr) => acc + curr.score, 0) / testResults.length) : 0;

        const recentProgress = await prisma.userProgress.findMany({
            where: { is_completed: true, completed_at: { not: null } },
            take: 5,
            orderBy: { completed_at: 'desc' },
            include: { user: { select: { first_name: true, last_name: true } }, lesson: { select: { title: true } } }
        });

        const recentTests = await prisma.testResult.findMany({
            take: 5,
            orderBy: { attempt_date: 'desc' },
            include: { user: { select: { first_name: true, last_name: true } }, test: { select: { title: true } } }
        });

        const activityFeed = [
            ...recentProgress.map(p => ({
                id: `p-${p.id}`,
                type: 'lesson',
                userName: `${p.user.first_name} ${p.user.last_name}`.trim(),
                targetName: p.lesson.title,
                date: p.completed_at,
                success: true
            })),
            ...recentTests.map(t => ({
                id: `t-${t.id}`,
                type: 'test',
                userName: `${t.user.first_name} ${t.user.last_name}`.trim(),
                targetName: t.test?.title || 'Тест',
                date: t.attempt_date,
                success: t.is_passed,
                score: t.score
            }))
        ].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()).slice(0, 8);

        return NextResponse.json({
            overview: { totalUsers, passRate, avgScore, totalViews: courseStats.reduce((acc, c) => acc + c.views, 0) },
            courseStats,
            activityFeed
        });

    } catch (error) {
        console.error('Statistic API Error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}