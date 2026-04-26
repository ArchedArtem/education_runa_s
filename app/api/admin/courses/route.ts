import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserRole(req: Request) {
    const authHeader = req.headers.get('authorization');
    let token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get('auth_token')?.value || null;
    }

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true }
        });
        return user?.role?.name || null;
    } catch {
        return null;
    }
}

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
        const role = await getUserRole(request);

        if (!role) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

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