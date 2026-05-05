import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const settings = await prisma.systemSettings.findFirst();

        if (settings && !settings.allowRegistration) {
            return NextResponse.json({ error: "Регистрация на данный момент закрыта администратором" }, { status: 403 });
        }

        const body = await request.json();
        const { fullName, email, companyData, inviteCode, password } = body;

        if (!email || !password || !fullName || !companyData) {
            return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
        }

        if (settings?.inviteOnly) {
            if (!inviteCode) {
                return NextResponse.json({ error: "Необходим пригласительный код" }, { status: 400 });
            }

            const validInvite = await prisma.inviteCode.findUnique({
                where: { code: inviteCode }
            });

            if (!validInvite || !validInvite.isActive) {
                return NextResponse.json({ error: "Неверный или неактивный код доступа" }, { status: 400 });
            }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [firstName, ...lastNameArr] = fullName.split(" ");
        const lastName = lastNameArr.join(" ");

        const newUser = await prisma.user.create({
            data: {
                first_name: firstName,
                last_name: lastName || "",
                email: email,
                password_hash: hashedPassword,
                company_name: companyData,
                role: {
                    connectOrCreate: {
                        where: { name: "client" },
                        create: { name: "client", description: "Клиент платформы" },
                    },
                },
            },
        });

        return NextResponse.json(
            { message: "Пользователь успешно зарегистрирован" },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}