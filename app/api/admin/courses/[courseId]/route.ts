import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.courseId, 10);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Неверный ID курса' }, { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: { id }
        });

        if (!course) {
            return NextResponse.json({ error: 'Курс не найден' }, { status: 404 });
        }

        return NextResponse.json(course, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.courseId, 10);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Неверный ID курса' }, { status: 400 });
        }

        const body = await request.json();
        const { title, software_product, authors, description, thumbnail_url, is_published } = body;

        if (!title || !software_product) {
            return NextResponse.json(
                { error: 'Название и программный продукт 1С обязательны' },
                { status: 400 }
            );
        }

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
                title,
                software_product,
                authors,
                description,
                thumbnail_url,
                is_published
            }
        });

        return NextResponse.json(updatedCourse, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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