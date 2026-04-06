import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            orderBy: {
                created_at: 'desc'
            },
            include: {
                _count: {
                    select: { lessons: true }
                }
            }
        });

        return NextResponse.json(courses, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, softwareProduct, authors, description, thumbnailUrl, isPublished } = body;

        if (!title || !softwareProduct) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const course = await prisma.course.create({
            data: {
                title,
                software_product: softwareProduct,
                authors: authors || null,
                description: description || null,
                thumbnail_url: thumbnailUrl || null,
                is_published: isPublished || false,
            },
        });

        return NextResponse.json(course, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 });
    }
}