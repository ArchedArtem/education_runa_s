import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

async function getUserId(req: Request) {
    const authHeader = req.headers.get('authorization');
    let token = authHeader ? authHeader.split(' ')[1] : null;
    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get('auth_token')?.value || null;
    }
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Конспект пуст' }, { status: 400 });
        }

        const prompt = `
Ты опытный методист 1С. Прочитай следующий конспект урока и составь 5 тестовых вопросов для проверки знаний клиента.
Сделай микс из вопросов: часть должна быть с одним правильным ответом (тип "single"), а часть — с несколькими правильными ответами (тип "multiple").
У каждого вопроса должно быть 4 варианта ответа.

Текст урока (HTML):
${content}

Ответь СТРОГО в формате JSON. Никакого дополнительного текста до или после JSON.
Структура JSON должна быть такой:
{
  "questions": [
    {
      "text": "Текст вопроса (один ответ)?",
      "type": "single",
      "options": [
        { "text": "Правильный вариант", "isCorrect": true },
        { "text": "Неправильный вариант", "isCorrect": false },
        { "text": "Неправильный вариант", "isCorrect": false },
        { "text": "Неправильный вариант", "isCorrect": false }
      ]
    }
  ]
}`;

        const modelName = 'llama-3.3-70b-versatile';

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const resultJSON = JSON.parse(data.choices[0].message.content);

        const usage = data.usage;

        if (usage) {
            await prisma.aiUsageLog.create({
                data: {
                    user_id: userId,
                    prompt_tokens: usage.prompt_tokens || 0,
                    completion_tokens: usage.completion_tokens || 0,
                    total_tokens: usage.total_tokens || 0,
                    model_name: modelName
                }
            });
        }

        return NextResponse.json(resultJSON, { status: 200 });

    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}