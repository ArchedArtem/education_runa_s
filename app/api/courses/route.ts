import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            where: {
                is_published: true,
            },
            orderBy: {
                created_at: 'desc'
            },
            select: {
                id: true,
                title: true,
                description: true,
                software_product: true,
                thumbnail_url: true,
            }
        });

        return NextResponse.json(courses, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}