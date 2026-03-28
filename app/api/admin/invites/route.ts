import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const invites = await prisma.inviteCode.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(invites, { status: 200 });
    } catch (error) {
        console.error("Ошибка при получении инвайт-кодов:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
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
        console.error("Ошибка при создании инвайт-кода:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
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
        console.error("Ошибка при обновлении инвайт-кода:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
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
        console.error("Ошибка при удалении инвайт-кода:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}