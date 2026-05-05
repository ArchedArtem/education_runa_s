import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'diman-top';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        let token: string | null = authHeader ? authHeader.split(' ')[1] : null;

        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get('auth_token')?.value || null;
        }

        if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Невалидный токен' }, { status: 401 });
        }

        // 1. Считаем клиентов (пользователей)
        const totalUsers = await prisma.user.count();

        // 2. Активные курсы
        const activeCourses = await prisma.course.count({
            where: { is_published: true }
        });

        // 3. Средний балл
        const avgScoreAgg = await prisma.testResult.aggregate({
            _avg: { score: true }
        });
        const avgTestScore = Math.round(avgScoreAgg._avg.score || 0);

        // 4. Завершаемость (отношение пройденных уроков ко всем начатым)
        const totalProgress = await prisma.userProgress.count();
        const completedProgress = await prisma.userProgress.count({
            where: { is_completed: true }
        });
        const completionRate = totalProgress > 0
            ? Math.round((completedProgress / totalProgress) * 100)
            : 0;

        // 5. Новые клиенты (последние 4)
        const recentUsers = await prisma.user.findMany({
            take: 4,
            orderBy: { created_at: 'desc' },
            select: { id: true, first_name: true, last_name: true, email: true, created_at: true, is_block: true, company_name: true }
        });

        const formattedRecent = recentUsers.map(u => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`.trim(),
            company: u.company_name || 'Частное лицо',
            email: u.email,
            date: new Date(u.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
            status: u.is_block ? 'Заблокирован' : 'Активен'
        }));

        // 6. График: Уроки за последние 7 дней
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentActivity = await prisma.userProgress.findMany({
            where: {
                is_completed: true,
                completed_at: { gte: sevenDaysAgo }
            },
            select: { completed_at: true }
        });

        // Формируем массив из 7 последних дней
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

            // Считаем сколько уроков пройдено в этот день
            const count = recentActivity.filter(a =>
                a.completed_at && a.completed_at.toISOString().startsWith(dateStr)
            ).length;

            chartData.push({ date: dateStr, count });
        }

        // Вычисляем максимум для высоты столбиков на фронтенде
        const maxActivity = Math.max(...chartData.map(d => d.count), 1);

        return NextResponse.json({
            stats: {
                totalUsers,
                activeCourses,
                avgTestScore,
                completionRate
            },
            recentUsers: formattedRecent,
            chart: {
                data: chartData,
                max: maxActivity
            }
        });

    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}