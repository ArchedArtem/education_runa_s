import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

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

export async function GET(request: Request) {
    try {
        const role = await getUserRole(request);
        if (!role || (role !== 'Admin' && role !== 'Moderator')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const comments = await prisma.courseComment.findMany({
            include: {
                user: {
                    select: { first_name: true, last_name: true, email: true }
                },
                course: {
                    select: { title: true }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const role = await getUserRole(request);
        if (!role || (role !== 'Admin' && role !== 'Moderator')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID комментария не предоставлен" }, { status: 400 });
        }

        await prisma.courseComment.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true, message: "Комментарий удален" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}