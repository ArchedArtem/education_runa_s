import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        if (user.is_block) {
            return NextResponse.json({ authenticated: true, is_block: true }, { status: 403 });
        }

        const { password_hash, reset_token, ...safeUser } = user;

        return NextResponse.json({ authenticated: true, is_block: false, user: safeUser }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
        const body = await request.json();
        const { first_name, last_name, email, current_password, new_password } = body;

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

        const updateData: any = {
            first_name,
            last_name,
            email
        };

        if (new_password) {
            if (!current_password) {
                return NextResponse.json({ error: "Введите текущий пароль для подтверждения изменений" }, { status: 400 });
            }

            const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
            if (!isPasswordValid) {
                return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 });
            }

            updateData.password_hash = await bcrypt.hash(new_password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: updateData
        });

        return NextResponse.json({ message: "Данные успешно сохранены" }, { status: 200 });

    } catch (error) {
        console.error("Ошибка при обновлении профиля:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}