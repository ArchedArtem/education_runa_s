import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
        const userId = decoded.userId;

        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.courseId, 10);

        if (isNaN(courseId)) {
            return NextResponse.json({ error: "Неверный ID курса" }, { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                is_published: true
            },
            include: {
                lessons: {
                    orderBy: { order_index: 'asc' },
                    include: {
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

        const formattedCourse = {
            id: course.id,
            title: course.title,
            description: course.description,
            software_product: course.software_product,
            thumbnail_url: course.thumbnail_url,
            authors: course.authors || "Методический отдел Руна С",
            lessons: course.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                order: lesson.order_index,
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