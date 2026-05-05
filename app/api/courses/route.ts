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
            include: {
                _count: {
                    select: { lessons: true, likes: true }
                }
            }
        });

        const formattedCourses = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            software_product: course.software_product,
            thumbnail_url: course.thumbnail_url,
            lessonsCount: course._count.lessons,
            likesCount: course._count.likes
        }));

        return NextResponse.json(formattedCourses, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}