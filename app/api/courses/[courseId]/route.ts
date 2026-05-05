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

        if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
        const userId = decoded.userId;

        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.courseId, 10);

        if (isNaN(courseId)) return NextResponse.json({ error: "Неверный ID курса" }, { status: 400 });

        const course = await prisma.course.findUnique({
            where: { id: courseId, is_published: true },
            include: {
                lessons: {
                    orderBy: { order_index: 'asc' },
                    include: { progress: { where: { user_id: userId } } }
                },
                likes: true,
                comments: {
                    orderBy: { created_at: 'desc' },
                    include: { user: { select: { first_name: true, last_name: true } } }
                }
            }
        });

        if (!course) return NextResponse.json({ error: "Курс не найден" }, { status: 404 });

        const formattedCourse = {
            id: course.id,
            title: course.title,
            description: course.description,
            software_product: course.software_product,
            thumbnail_url: course.thumbnail_url,
            authors: course.authors || "Методический отдел Руна С",
            likesCount: course.likes.length,
            isLiked: course.likes.some(like => like.user_id === userId),
            comments: course.comments.map(c => ({
                id: c.id,
                text: c.text,
                date: c.created_at,
                authorName: `${c.user.first_name} ${c.user.last_name}`.trim()
            })),
            lessons: course.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                order: lesson.order_index,
                is_completed: lesson.progress.length > 0 ? lesson.progress[0].is_completed : false
            }))
        };

        return NextResponse.json(formattedCourse, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
        const userId = decoded.userId;

        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.courseId, 10);
        const body = await request.json();

        if (body.action === 'toggle_like') {
            const existingLike = await prisma.courseLike.findUnique({
                where: { course_id_user_id: { course_id: courseId, user_id: userId } }
            });

            if (existingLike) {
                await prisma.courseLike.delete({ where: { id: existingLike.id } });
                return NextResponse.json({ liked: false });
            } else {
                await prisma.courseLike.create({ data: { course_id: courseId, user_id: userId } });
                return NextResponse.json({ liked: true });
            }
        }

        if (body.action === 'add_comment') {
            if (!body.text || body.text.trim() === '') return NextResponse.json({ error: "Пустой комментарий" }, { status: 400 });

            const comment = await prisma.courseComment.create({
                data: { course_id: courseId, user_id: userId, text: body.text.trim() },
                include: { user: { select: { first_name: true, last_name: true } } }
            });

            return NextResponse.json({
                id: comment.id,
                text: comment.text,
                date: comment.created_at,
                authorName: `${comment.user.first_name} ${comment.user.last_name}`.trim()
            });
        }

        return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}