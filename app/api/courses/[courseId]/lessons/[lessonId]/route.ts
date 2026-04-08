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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.courseId, 10);
        const currentLessonId = parseInt(resolvedParams.lessonId, 10);

        if (isNaN(courseId) || isNaN(currentLessonId)) {
            return NextResponse.json({ error: "Неверные ID" }, { status: 400 });
        }

        const allLessons = await prisma.lesson.findMany({
            where: { course_id: courseId },
            orderBy: { order_index: 'asc' },
            include: {
                progress: { where: { user_id: userId } },
                test: { select: { id: true } },
                materials: true
            }
        });

        if (allLessons.length === 0) {
            return NextResponse.json({ error: "Уроки не найдены" }, { status: 404 });
        }

        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex === -1) {
            return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
        }

        const currentLesson = allLessons[currentIndex];
        const nextLesson = allLessons[currentIndex + 1] || null; // Урок для кнопки "Далее"

        const responseData = {
            lesson: {
                id: currentLesson.id,
                title: currentLesson.title,
                content: currentLesson.content,
                videoUrl: currentLesson.video_url,
                hasTest: !!currentLesson.test,
                isCompleted: currentLesson.progress.length > 0 ? currentLesson.progress[0].is_completed : false,
                nextLessonId: nextLesson ? nextLesson.id : null
            },
            materials: currentLesson.materials.map(m => ({
                id: m.id,
                name: m.file_name,
                url: m.file_url,
                size: '...',
                icon: m.file_type === 'pdf' ? 'picture_as_pdf' : m.file_type.includes('xls') ? 'table' : 'description'
            })),
            playlist: allLessons.map(l => ({
                id: l.id,
                title: l.title,
                duration: l.duration || '00:00',
                isCompleted: l.progress.length > 0 ? l.progress[0].is_completed : false,
                isCurrent: l.id === currentLessonId,
                hasTest: !!l.test
            }))
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("GET Lesson Error:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

        const resolvedParams = await params;
        const lessonId = parseInt(resolvedParams.lessonId, 10);

        const { isCompleted } = await request.json();

        let progress = await prisma.userProgress.findFirst({
            where: { user_id: userId, lesson_id: lessonId }
        });

        if (progress) {
            progress = await prisma.userProgress.update({
                where: { id: progress.id },
                data: { is_completed: isCompleted }
            });
        } else {
            progress = await prisma.userProgress.create({
                data: { user_id: userId, lesson_id: lessonId, is_completed: isCompleted }
            });
        }

        return NextResponse.json({ success: true, isCompleted: progress.is_completed }, { status: 200 });

    } catch (error) {
        console.error("Update Progress Error:", error);
        return NextResponse.json({ error: "Ошибка обновления прогресса" }, { status: 500 });
    }
}