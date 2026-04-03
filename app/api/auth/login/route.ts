import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Введите email и пароль" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
        }

        if (user.is_block) {
            return NextResponse.json({ error: "Ваша учетная запись заблокирована" }, { status: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET || "default_secret";
        const token = jwt.sign(
            { userId: user.id, roleId: user.role_id },
            secret,
            { expiresIn: "1d" }
        );

        const cookieStore = await cookies();
        cookieStore.set({
            name: "auth_token",
            value: token,
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24,
        });

        return NextResponse.json({ message: "Успешный вход" }, { status: 200 });

    } catch (error) {
        console.error("Ошибка при входе:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}