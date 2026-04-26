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
            token = cookieStore.get('auth_token')?.value|| null;
        }

        if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 });
        }

        const url = new URL(req.url);
        const period = url.searchParams.get('period') || 'all';

        let targetDate: Date | undefined = undefined;
        if (period === '7d') {
            targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - 7);
        } else if (period === '30d') {
            targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - 30);
        }

        const progressFilter: any = { is_completed: true };
        if (targetDate) {
            progressFilter.completed_at = { gte: targetDate };
        }

        const testFilter: any = {};
        if (targetDate) {
            testFilter.attempt_date = { gte: targetDate };
        }

        const courses = await prisma.course.findMany({
            select: {
                id: true, title: true,
                lessons: {
                    select: {
                        progress: {
                            where: progressFilter,
                            select: { user_id: true }
                        }
                    }
                }
            }
        });

        let totalUniquePlatformUsers = new Set<string>();

        const courseStats = courses.map(course => {
            let uniqueCourseUsers = new Set<string>();
            let totalLessonsCompleted = 0;

            course.lessons.forEach(lesson => {
                lesson.progress.forEach(p => {
                    uniqueCourseUsers.add(p.user_id);
                    totalUniquePlatformUsers.add(p.user_id);
                    totalLessonsCompleted++;
                });
            });

            const totalLessonsInCourse = course.lessons.length;
            const maxPossibleProgress = uniqueCourseUsers.size * totalLessonsInCourse;
            const completionRate = maxPossibleProgress > 0
                ? Math.round((totalLessonsCompleted / maxPossibleProgress) * 100)
                : 0;

            return {
                id: course.id,
                title: course.title,
                uniqueViews: uniqueCourseUsers.size,
                completionRate
            };
        }).sort((a, b) => b.uniqueViews - a.uniqueViews);

        const testResults = await prisma.testResult.findMany({
            where: testFilter,
            select: { is_passed: true, score: true }
        });

        const passedTestsCount = testResults.filter(t => t.is_passed).length;
        const passRate = testResults.length > 0 ? Math.round((passedTestsCount / testResults.length) * 100) : 0;
        const avgScore = testResults.length > 0 ? Math.round(testResults.reduce((acc, curr) => acc + curr.score, 0) / testResults.length) : 0;

        const topStudentsGroups = await prisma.testResult.groupBy({
            by: ['user_id'],
            _avg: { score: true },
            _count: { id: true },
            where: testFilter,
            orderBy: { _avg: { score: 'desc' } },
            take: 4
        });

        const topStudents = await Promise.all(topStudentsGroups.map(async (st) => {
            const u = await prisma.user.findUnique({
                where: { id: st.user_id },
                select: { first_name: true, last_name: true, company_name: true }
            });
            return {
                name: `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || 'Студент',
                company: u?.company_name || 'Частное лицо',
                avgScore: Math.round(st._avg.score || 0),
                testsTaken: st._count.id
            };
        }));

        const testDiffGroups = await prisma.testResult.groupBy({
            by: ['test_id'],
            _avg: { score: true },
            where: testFilter,
            orderBy: { _avg: { score: 'asc' } },
            take: 3
        });

        const problematicTests = await Promise.all(testDiffGroups.map(async (td) => {
            const t = await prisma.test.findUnique({
                where: { id: td.test_id },
                include: {
                    lesson: { select: { course_id: true } }
                }
            });
            return {
                title: t?.title || 'Удаленный тест',
                avgScore: Math.round(td._avg.score || 0),
                courseId: t?.course_id || t?.lesson?.course_id || null,
                lessonId: t?.lesson_id || null
            };
        }));

        const recentProgress = await prisma.userProgress.findMany({
            where: progressFilter,
            take: 5,
            orderBy: { id: 'desc' },
            include: { user: { select: { first_name: true, last_name: true } }, lesson: { select: { title: true } } }
        });

        const recentTestsFeed = await prisma.testResult.findMany({
            where: testFilter,
            take: 5,
            orderBy: { id: 'desc' },
            include: { user: { select: { first_name: true, last_name: true } }, test: { select: { title: true } } }
        });

        const activityFeed = [
            ...recentProgress.map(p => ({
                id: `p-${p.id}`, type: 'lesson',
                userName: `${p.user.first_name} ${p.user.last_name}`.trim(),
                targetName: p.lesson.title,
                date: p.completed_at,
                success: true
            })),
            ...recentTestsFeed.map(t => ({
                id: `t-${t.id}`, type: 'test',
                userName: `${t.user.first_name} ${t.user.last_name}`.trim(),
                targetName: t.test?.title || 'Тест',
                date: t.attempt_date,
                success: t.is_passed,
                score: t.score
            }))
        ].sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            return timeB - timeA;
        }).slice(0, 8);

        return NextResponse.json({
            overview: {
                activeUsers: totalUniquePlatformUsers.size,
                passRate,
                avgScore,
                totalViews: courseStats.reduce((acc, c) => acc + c.uniqueViews, 0)
            },
            courseStats,
            topStudents,
            problematicTests,
            activityFeed
        });

    } catch (error) {
        console.error('Statistic API Error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}