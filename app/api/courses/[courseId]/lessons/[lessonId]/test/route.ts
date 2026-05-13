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
        const lessonId = parseInt(resolvedParams.lessonId, 10);

        const test = await prisma.test.findUnique({
            where: { lesson_id: lessonId },
            include: {
                questions: {
                    include: { answers: true }
                }
            }
        });

        if (!test) return NextResponse.json({ error: "Тест не найден" }, { status: 404 });

        const safeTest = {
            id: test.id,
            title: test.title,
            passingScore: test.passing_score,
            questions: test.questions.map(q => ({
                id: q.id,
                text: q.question_text,
                type: q.question_type,
                options: q.answers.map(a => ({
                    id: a.id,
                    text: a.answer_text
                }))
            }))
        };

        return NextResponse.json(safeTest, { status: 200 });

    } catch (error) {
        console.error("GET Test Error:", error);
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
        const courseId = parseInt(resolvedParams.courseId, 10);

        const { answers } = await request.json();

        const test = await prisma.test.findUnique({
            where: { lesson_id: lessonId },
            include: { questions: { include: { answers: true } } }
        });

        if (!test) return NextResponse.json({ error: "Тест не найден" }, { status: 404 });

        let correctCount = 0;
        const totalQuestions = test.questions.length;

        test.questions.forEach(q => {
            const correctOptionIds = q.answers.filter(a => a.is_correct).map(a => a.id);
            const userOptionIds = answers[q.id] || [];

            const isCorrect =
                correctOptionIds.length === userOptionIds.length &&
                correctOptionIds.every(id => userOptionIds.includes(id));

            if (isCorrect) correctCount++;
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const isPassed = score >= test.passing_score;

        let isCourseCompleted = false;
        let certificateId = null;

        await prisma.$transaction(async (tx) => {
            await tx.testResult.create({
                data: {
                    user_id: userId,
                    test_id: test.id,
                    score: score,
                    is_passed: isPassed
                }
            });

            if (isPassed) {
                const existingProgress = await tx.userProgress.findFirst({
                    where: { user_id: userId, lesson_id: lessonId }
                });

                if (existingProgress) {
                    await tx.userProgress.update({
                        where: { id: existingProgress.id },
                        data: { is_completed: true }
                    });
                } else {
                    await tx.userProgress.create({
                        data: { user_id: userId, lesson_id: lessonId, is_completed: true }
                    });
                }

                const allTests = await tx.test.findMany({
                    where: {
                        lesson: { course_id: courseId }
                    }
                });

                const passedResults = await tx.testResult.findMany({
                    where: {
                        user_id: userId,
                        is_passed: true,
                        test: { lesson: { course_id: courseId } }
                    },
                    distinct: ['test_id']
                });

                if (allTests.length > 0 && passedResults.length >= allTests.length) {
                    isCourseCompleted = true;

                    let cert = await tx.certificate.findUnique({
                        where: {
                            user_id_course_id: { user_id: userId, course_id: courseId }
                        }
                    });

                    if (!cert) {
                        const certNumber = `RUNA-${courseId}-${userId.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
                        cert = await tx.certificate.create({
                            data: {
                                user_id: userId,
                                course_id: courseId,
                                certificate_number: certNumber
                            }
                        });
                    }
                    certificateId = cert.id;
                }
            }
        });

        return NextResponse.json({
            score,
            isPassed,
            passingScore: test.passing_score,
            isCourseCompleted,
            certificateId
        }, { status: 200 });

    } catch (error) {
        console.error("POST Test Submit Error:", error);
        return NextResponse.json({ error: "Ошибка при проверке теста" }, { status: 500 });
    }
}