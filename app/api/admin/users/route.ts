import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

export async function GET(request: Request) {
    try {
        const role = await getUserRole(request);
        if (!role || (role !== 'Admin' && role !== 'Moderator')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const role = await getUserRole(request);
        if (role !== 'Admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { first_name, last_name, email, company_name, password, role_id } = body;

        if (!email || !password || !first_name || !last_name) {
            return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                email,
                company_name: company_name || null,
                password_hash,
                role_id: Number(role_id),
                is_block: false,
            }
        });

        return NextResponse.json(
            { message: "Пользователь успешно создан", user: newUser },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const role = await getUserRole(request);
        if (!role || (role !== 'Admin' && role !== 'Moderator')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { id, action, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "Не передан ID пользователя" }, { status: 400 });
        }

        const userId = typeof id === 'string' ? id : String(id);

        if (action === 'toggle_block') {
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user) {
                return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { is_block: !user.is_block }
            });

            return NextResponse.json({ message: "Статус изменен", user: updatedUser }, { status: 200 });
        }

        if (action === 'edit') {
            if (role !== 'Admin') {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    company_name: data.company_name || null,
                    role_id: Number(data.role_id),
                }
            });

            return NextResponse.json({ message: "Данные обновлены", user: updatedUser }, { status: 200 });
        }

        return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}