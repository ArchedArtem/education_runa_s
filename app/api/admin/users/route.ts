import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Ошибка GET /users:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
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
        console.error("Ошибка POST /users:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, action, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "Не передан ID пользователя" }, { status: 400 });
        }

        const userId = isNaN(Number(id)) ? id : Number(id);

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
