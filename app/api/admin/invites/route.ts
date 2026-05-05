// app/api/admin/invites/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
        if (role !== 'Admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const invites = await prisma.inviteCode.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(invites, { status: 200 });
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
        const { code, description } = body;

        if (!code || code.trim() === '') {
            return NextResponse.json({ error: "Код доступа не может быть пустым" }, { status: 400 });
        }

        const upperCode = code.trim().toUpperCase();

        const existingCode = await prisma.inviteCode.findUnique({
            where: { code: upperCode }
        });

        if (existingCode) {
            return NextResponse.json({ error: "Такой код доступа уже существует в системе" }, { status: 400 });
        }

        const newInvite = await prisma.inviteCode.create({
            data: {
                code: upperCode,
                description: description ? description.trim() : null,
                isActive: true,
            }
        });

        return NextResponse.json(
            { message: "Код успешно создан", invite: newInvite },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const role = await getUserRole(request);
        if (role !== 'Admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Не передан ID кода" }, { status: 400 });
        }

        const inviteCode = await prisma.inviteCode.findUnique({
            where: { id: Number(id) }
        });

        if (!inviteCode) {
            return NextResponse.json({ error: "Код не найден" }, { status: 404 });
        }

        const updatedInvite = await prisma.inviteCode.update({
            where: {id: Number(id)},
            data: {
                isActive: !inviteCode.isActive
            }
        });

        return NextResponse.json(
            { message: "Код успешно обновлен", invite: updatedInvite },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const role = await getUserRole(request);
        if (role !== 'Admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Не передан ID кода" }, { status: 400 });
        }

        const inviteCode = await prisma.inviteCode.findUnique({
            where: { id: Number(id) }
        });

        if (!inviteCode) {
            return NextResponse.json({ error: "Код не найден" }, { status: 404 });
        } else{
            await prisma.inviteCode.delete({
                where: {id: Number(id)}
            });
        }

        return NextResponse.json(
            { message: "Код успешно удален"},
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}