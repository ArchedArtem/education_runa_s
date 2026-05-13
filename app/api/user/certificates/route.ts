import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const certificates = await prisma.certificate.findMany({
            where: { user_id: userId },
            include: {
                course: {
                    select: { title: true }
                }
            },
            orderBy: { issued_at: 'desc' }
        });

        return NextResponse.json(certificates, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}