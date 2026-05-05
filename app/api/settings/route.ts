import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.systemSettings.findFirst({
            select: {
                platformName: true,
                supportEmail: true,
                supportPhone: true,
                address: true,
                workingHours: true,
                allowRegistration: true,
                inviteOnly: true,
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Ошибка получения настроек' }, { status: 500 });
    }
}