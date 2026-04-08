import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.courseId, 10);

        if (isNaN(courseId)) {
            return NextResponse.json({ error: 'Неверный ID курса' }, { status: 400 });
        }

        const lessons = await prisma.lesson.findMany({
            where: { course_id: courseId },
            orderBy: { order_index: 'asc' },
            include: {
                materials: { select: { id: true } },
                test: { select: { id: true } }
            }
        });

        const formattedLessons = lessons.map(lesson => ({
            id: lesson.id,
            order: lesson.order_index,
            title: lesson.title,
            duration: lesson.duration || '00:00',
            hasVideo: !!lesson.video_url,
            hasText: !!lesson.content && lesson.content.length > 0,
            hasFiles: lesson.materials.length > 0,
            hasTest: !!lesson.test,
            isPublished: lesson.is_published
        }));

        return NextResponse.json(formattedLessons, { status: 200 });

    } catch (error) {
        console.error('GET Lessons Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.courseId, 10);

        if (isNaN(courseId)) {
            return NextResponse.json({ error: 'Неверный ID курса' }, { status: 400 });
        }

        const body = await request.json();
        const { title, content, video_url, duration, materials, test, is_published } = body;

        if (!title) {
            return NextResponse.json({ error: 'Название урока обязательно' }, { status: 400 });
        }

        const aggregations = await prisma.lesson.aggregate({
            where: { course_id: courseId },
            _max: { order_index: true }
        });
        const newOrderIndex = (aggregations._max.order_index || 0) + 1;

        const newLesson = await prisma.lesson.create({
            data: {
                course_id: courseId,
                title,
                content,
                video_url,
                duration: duration || '00:00',
                order_index: newOrderIndex,
                is_published: is_published || false,

                materials: materials && materials.length > 0 ? {
                    create: materials.map((m: any) => ({
                        file_name: m.name,
                        file_url: m.url,
                        file_type: m.type
                    }))
                } : undefined,

                test: test && test.questions && test.questions.length > 0 ? {
                    create: {
                        title: `Тест к уроку: ${title}`,
                        passing_score: test.passing_score,
                        questions: {
                            create: test.questions.map((q: any) => ({
                                question_text: q.question_text,
                                question_type: q.question_type,
                                answers: {
                                    create: q.answers.map((ans: any) => ({
                                        answer_text: ans.answer_text,
                                        is_correct: ans.is_correct
                                    }))
                                }
                            }))
                        }
                    }
                } : undefined
            }
        });

        return NextResponse.json(newLesson, { status: 201 });

    } catch (error) {
        console.error('CREATE Lesson Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}