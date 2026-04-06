import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const resolvedParams = await params;

        const id = parseInt(resolvedParams.courseId, 10);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Неверный ID курса' }, { status: 400 });
        }

        await prisma.course.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Курс успешно удален' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}