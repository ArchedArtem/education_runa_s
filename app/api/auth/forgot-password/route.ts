import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Введите email" }, { status: 400 });
        }

        // 1. Ищем пользователя
        const user = await prisma.user.findUnique({ where: { email } });

        // ВАЖНО: В целях безопасности мы не говорим, если email не найден,
        // чтобы хакеры не могли перебирать почты. Просто возвращаем "успех".
        if (!user) {
            return NextResponse.json({ message: "Если email существует, письмо отправлено" }, { status: 200 });
        }

        // 2. Генерируем надежный случайный токен
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Токен будет жить ровно 1 час (3600000 миллисекунд)
        const tokenExpires = new Date(Date.now() + 3600000);

        // 3. Сохраняем токен в базу
        await prisma.user.update({
            where: { email },
            data: {
                reset_token: resetToken,
                reset_token_expires: tokenExpires,
            },
        });

        // 4. Формируем ссылку для сброса
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${appUrl}/reset-password/${resetToken}`;

        // 5. Отправляем письмо через Resend
        await resend.emails.send({
            from: `Руна С Обучение <${process.env.RESEND_FROM_EMAIL}>`,
            to: email,
            subject: "Восстановление пароля | Руна С Обучение",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Восстановление доступа</h2>
                    <p>Здравствуйте, ${user.first_name}!</p>
                    <p>Вы запросили сброс пароля для вашей учетной записи на обучающей платформе <strong>Руна С</strong>.</p>
                    <p>Пожалуйста, нажмите на кнопку ниже, чтобы придумать новый пароль. Эта ссылка действительна в течение 1 часа.</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                        Сбросить пароль
                    </a>
                    <p style="color: #666; font-size: 14px;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
                </div>
            `,
        });

        return NextResponse.json({ message: "Письмо успешно отправлено" }, { status: 200 });

    } catch (error) {
        console.error("Ошибка при восстановлении пароля:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}