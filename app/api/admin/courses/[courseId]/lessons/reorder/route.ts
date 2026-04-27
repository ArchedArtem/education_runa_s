import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
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
        const { lessons } = body;

        if (!lessons || !Array.isArray(lessons)) {
            return NextResponse.json({ error: 'Неверный формат данных' }, { status: 400 });
        }

        const updates = lessons.map((lesson: { id: number, order: number }) => {
            return prisma.lesson.update({
                where: { id: lesson.id, course_id: courseId },
                data: { order_index: lesson.order }
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('REORDER Lessons Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}