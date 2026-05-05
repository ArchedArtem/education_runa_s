import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Проверь правильность пути к твоему файлу prisma

export async function GET() {
    try {
        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: { id: 1 }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Ошибка при получении настроек:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        const updatedSettings = await prisma.systemSettings.upsert({
            where: { id: 1 },
            update: {
                platformName: body.platformName,
                supportEmail: body.supportEmail,
                supportPhone: body.supportPhone,
                address: body.address,
                workingHours: body.workingHours,
                allowRegistration: body.allowRegistration,
                inviteOnly: body.inviteOnly,
            },
            create: {
                id: 1,
                platformName: body.platformName,
                supportEmail: body.supportEmail,
                supportPhone: body.supportPhone,
                address: body.address,
                workingHours: body.workingHours,
                allowRegistration: body.allowRegistration,
                inviteOnly: body.inviteOnly,
            }
        });

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error('Ошибка при сохранении настроек:', error);
        return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
    }
}