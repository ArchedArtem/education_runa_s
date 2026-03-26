import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
        }

        // 1. Ищем пользователя с таким токеном, который еще не протух
        const user = await prisma.user.findFirst({
            where: {
                reset_token: token,
                reset_token_expires: {
                    gt: new Date(), // Время истечения больше, чем "сейчас"
                },
            },
        });

        // Если токена нет в базе или прошел уже час:
        if (!user) {
            return NextResponse.json({ error: "Ссылка недействительна или устарела. Запросите новую." }, { status: 400 });
        }

        // 2. Хэшируем новый пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Сохраняем новый пароль и стираем токены (чтобы ссылку нельзя было использовать дважды)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                reset_token: null,
                reset_token_expires: null,
            },
        });

        return NextResponse.json({ message: "Пароль успешно изменен" }, { status: 200 });

    } catch (error) {
        console.error("Ошибка при сбросе пароля:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}