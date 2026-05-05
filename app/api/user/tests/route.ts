import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'diman-top';

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

        const historyRecords = await prisma.testResult.findMany({
            where: { user_id: userId },
            include: {
                test: {
                    include: { course: true, lesson: true }
                }
            },
            orderBy: { attempt_date: 'desc' }
        });

        const passedTestIds = historyRecords
            .filter(record => record.is_passed)
            .map(record => record.test_id);

        const allTests = await prisma.test.findMany({
            include: {
                course: { select: { title: true } },
                lesson: { select: { title: true, is_published: true } }
            }
        });

        const availableTests = allTests
            .filter(test => test.lesson?.is_published && !passedTestIds.includes(test.id))
            .map(test => ({
                id: test.id,
                title: test.title,
                courseName: test.course?.title || 'Без курса',
                courseId: test.course_id,
                lessonId: test.lesson_id,
                passingScore: test.passing_score,
                maxScore: 100
            }));

        const testHistory = historyRecords.map(record => ({
            id: record.id,
            testId: record.test_id,
            title: record.test?.title || 'Удаленный тест',
            courseId: record.test?.course_id,
            lessonId: record.test?.lesson_id,
            attemptDate: record.attempt_date,
            score: record.score,
            maxScore: 100,
            isPassed: record.is_passed
        }));

        return NextResponse.json({ availableTests, testHistory });

    } catch (error) {
        console.error('API Tests Error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}