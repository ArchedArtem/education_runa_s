import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
    try {
        const resolvedParams = await params;
        const lessonId = parseInt(resolvedParams.lessonId, 10);

        if (isNaN(lessonId)) {
            return NextResponse.json({ error: 'Неверный ID урока' }, { status: 400 });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                materials: true,
                test: {
                    include: {
                        questions: {
                            include: { answers: true }
                        }
                    }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Урок не найден' }, { status: 404 });
        }

        return NextResponse.json(lesson, { status: 200 });
    } catch (error) {
        console.error('GET Lesson Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
    try {
        const resolvedParams = await params;
        const lessonId = parseInt(resolvedParams.lessonId, 10);

        if (isNaN(lessonId)) return NextResponse.json({ error: 'Неверный ID урока' }, { status: 400 });

        const body = await request.json();
        const { title, content, video_url, duration, materials, test, is_published } = body;

        if (!title) return NextResponse.json({ error: 'Название урока обязательно' }, { status: 400 });

        const updatedLesson = await prisma.$transaction(async (tx) => {
            const lesson = await tx.lesson.update({
                where: { id: lessonId },
                data: { title, content, video_url, duration, is_published }
            });

            await tx.material.deleteMany({ where: { lesson_id: lessonId } });
            if (materials && materials.length > 0) {
                await tx.material.createMany({
                    data: materials.map((m: any) => ({
                        lesson_id: lessonId,
                        file_name: m.name,
                        file_url: m.url,
                        file_type: m.type
                    }))
                });
            }

            if (test && test.isEnabled) {
                const upsertedTest = await tx.test.upsert({
                    where: { lesson_id: lessonId },
                    update: { title: `Тест к уроку: ${title}`, passing_score: test.passing_score },
                    create: { lesson_id: lessonId, title: `Тест к уроку: ${title}`, passing_score: test.passing_score }
                });

                await tx.question.deleteMany({ where: { test_id: upsertedTest.id } });

                for (const q of test.questions) {
                    await tx.question.create({
                        data: {
                            test_id: upsertedTest.id,
                            question_text: q.question_text,
                            question_type: q.question_type,
                            answers: {
                                create: q.answers.map((ans: any) => ({
                                    answer_text: ans.answer_text,
                                    is_correct: ans.is_correct
                                }))
                            }
                        }
                    });
                }
            } else {
                await tx.test.deleteMany({ where: { lesson_id: lessonId } });
            }

            return lesson;
        });

        return NextResponse.json(updatedLesson, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
    try {
        const resolvedParams = await params;
        const lessonId = parseInt(resolvedParams.lessonId, 10);

        if (isNaN(lessonId)) {
            return NextResponse.json({ error: 'Неверный ID урока' }, { status: 400 });
        }

        await prisma.lesson.delete({
            where: { id: lessonId }
        });

        return NextResponse.json({ message: 'Урок успешно удален' }, { status: 200 });

    } catch (error) {
        console.error('DELETE Lesson Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}