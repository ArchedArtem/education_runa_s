import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        let token: string | null = authHeader ? authHeader.split(' ')[1] : null;

        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get('auth_token')?.value || null;
        }

        if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true }
        });

        if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });

        return NextResponse.json({
            firstName: user.first_name,
            lastName: user.last_name,
            roleName: user.role?.name || 'admin',
            email: user.email
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Auth Me Error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}