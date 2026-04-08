import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        // 1. Получаем ID пользователя из кук (твоя логика из auth)
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
        const userId = decoded.userId;

        // 2. Получаем ID курса из параметров
        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.courseId, 10);

        if (isNaN(courseId)) {
            return NextResponse.json({ error: "Неверный ID курса" }, { status: 400 });
        }

        // 3. Тянем курс со всеми потрохами
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                is_published: true // Пользователь не должен видеть черновики
            },
            include: {
                lessons: {
                    orderBy: { order_index: 'asc' },
                    include: {
                        // Магия: берем прогресс ТОЛЬКО текущего юзера для каждого урока
                        progress: {
                            where: { user_id: userId }
                        }
                    }
                }
            }
        });

        if (!course) {
            return NextResponse.json({ error: "Курс не найден или не опубликован" }, { status: 404 });
        }

        // 4. Форматируем для фронта
        const formattedCourse = {
            id: course.id,
            title: course.title,
            description: course.description,
            software_product: course.software_product,
            thumbnail_url: course.thumbnail_url,
            authors: course.authors || "Методический отдел Руна С",
            // Превращаем массив прогресса в простой флаг is_completed
            lessons: course.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                order: lesson.order_index,
                // Если запись в таблице прогресса есть и там стоит true
                is_completed: lesson.progress.length > 0 ? lesson.progress[0].is_completed : false
            }))
        };

        return NextResponse.json(formattedCourse, { status: 200 });

    } catch (error) {
        console.error("Ошибка при получении деталей курса:", error);

        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: "Невалидный токен" }, { status: 401 });
        }

        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}