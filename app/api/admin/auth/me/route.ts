import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });
        }

        if (user.is_block) {
            return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 403 });
        }

        if (user.role_id !== 1 && user.role_id !== 3) {
            return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
        }

        const { password_hash, reset_token, ...safeAdmin } = user;

        return NextResponse.json({ authenticated: true, admin: safeAdmin }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка валидации токена" }, { status: 401 });
    }
}