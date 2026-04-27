import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
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
    },
    {
      "text": "Текст вопроса (несколько ответов)?",
      "type": "multiple",
      "options": [
        { "text": "Правильный вариант 1", "isCorrect": true },
        { "text": "Правильный вариант 2", "isCorrect": true },
        { "text": "Неправильный вариант", "isCorrect": false },
        { "text": "Неправильный вариант", "isCorrect": false }
      ]
    }
  ]
}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error('Groq API Error');
        }

        const data = await response.json();
        const resultJSON = JSON.parse(data.choices[0].message.content);

        return NextResponse.json(resultJSON, { status: 200 });

    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}