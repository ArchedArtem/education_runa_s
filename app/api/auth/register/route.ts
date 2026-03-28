import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, email, companyData, inviteCode, password } = body;

        if (!email || !password || !fullName || !companyData || !inviteCode) {
            return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
        }

        const validInvite = await prisma.inviteCode.findUnique({
            where: { code: inviteCode }
        });

        if (!validInvite || !validInvite.isActive) {
            return NextResponse.json({ error: "Неверный или неактивный код доступа" }, { status: 400 });
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
                        create: { name: "client", description: "Клиент компании Руна С" },
                    },
                },
            },
        });

        return NextResponse.json(
            { message: "Пользователь успешно зарегистрирован" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Ошибка при регистрации:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}