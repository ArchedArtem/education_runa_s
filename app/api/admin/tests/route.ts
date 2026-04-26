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

        try {
            jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 });
        }

        const tests = await prisma.test.findMany({
            include: {
                _count: {
                    select: { questions: true }
                },
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        is_published: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                software_product: true
                            }
                        }
                    }
                }
            },
            orderBy: { id: 'desc' }
        });

        const formattedTests = tests.map(t => ({
            id: t.id,
            title: t.title,
            passingScore: t.passing_score,
            questionsCount: t._count.questions,
            lessonId: t.lesson_id,
            lessonName: t.lesson?.title || 'Неизвестный урок',
            courseId: t.lesson?.course?.id,
            courseName: t.lesson?.course?.title || 'Без курса',
            softwareProduct: t.lesson?.course?.software_product || 'Разное',
            isPublished: t.lesson?.is_published || false
        }));

        return NextResponse.json(formattedTests, { status: 200 });

    } catch (error) {
        console.error('Admin Tests GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const testId = parseInt(url.searchParams.get('id') || '0', 10);

        if (!testId) return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });

        await prisma.test.delete({
            where: { id: testId }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Admin Tests DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}