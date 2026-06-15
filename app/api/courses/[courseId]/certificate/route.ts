import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const s3Client = new S3Client({
    region: process.env.S3_REGION || "ru-1",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true
});

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

export async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    let browser: any = null;

    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

        const host = request.headers.get("host") || "education-runa.ru";
        const { certificateId } = await request.json();

        const [certificate, settings] = await Promise.all([
            prisma.certificate.findUnique({
                where: { id: certificateId },
                include: { user: true, course: true }
            }),
            prisma.systemSettings.findFirst()
        ]);

        if (!certificate || certificate.user_id !== userId) {
            return NextResponse.json({ error: "Не найден" }, { status: 404 });
        }

        const platformName = settings?.platformName || "Runa S";
        let pdfUrl = certificate.pdf_url;

        if (!pdfUrl) {
            const isLocal = process.env.NODE_ENV === 'development';
            const localExecutablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

            if (!isLocal && typeof (chromium as any).setGraphicsMode === 'function') {
                (chromium as any).setGraphicsMode(false);
            }

            browser = await puppeteer.launch({
                args: isLocal
                    ? puppeteer.defaultArgs()
                    : [
                        ...chromium.args,
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ],
                defaultViewport: { width: 1920, height: 1080 },
                executablePath: isLocal ? localExecutablePath : await chromium.executablePath(),
                headless: isLocal ? true : (chromium as any).headless,
            });

            const page = await browser.newPage();

            const userName = `${certificate.user.first_name} ${certificate.user.last_name}`;
            const courseTitle = certificate.course.title;
            const certNumber = certificate.certificate_number;
            const date = new Date(certificate.issued_at).toLocaleDateString('ru-RU');

            const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap');
                  
                  html, body {
                    margin: 0;
                    padding: 0;
                    width: 297mm;
                    height: 210mm;
                    font-family: 'Manrope', sans-serif;
                    -webkit-print-color-adjust: exact;
                    background-color: #f8fafc;
                    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
                    background-size: 24px 24px;
                  }

                  .cert-wrapper {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    padding: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }

                  .cert-inner {
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    padding: 60px;
                    box-sizing: border-box;
                  }

                  .accent-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 12px;
                    background: linear-gradient(90deg, #2563eb, #1d4ed8);
                  }

                  .watermark {
                    position: absolute;
                    bottom: -40px;
                    right: -20px;
                    font-size: 220px;
                    font-weight: 800;
                    color: #f1f5f9;
                    line-height: 1;
                    z-index: 0;
                  }

                  .content {
                    position: relative;
                    z-index: 10;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                  }

                  .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                  }

                  .logo {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                  }
                  .logo span { color: #2563eb; }

                  .cert-title {
                    font-size: 56px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.03em;
                    text-transform: uppercase;
                  }

                  .main-body {
                    margin-top: auto;
                    margin-bottom: auto;
                  }

                  .label {
                    font-size: 16px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 12px;
                  }

                  .user-name {
                    font-size: 52px;
                    font-weight: 800;
                    color: #2563eb;
                    margin: 0 0 40px 0;
                    line-height: 1.1;
                  }

                  .course-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    max-width: 85%;
                    line-height: 1.3;
                  }

                  .footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    border-top: 2px solid #f1f5f9;
                    padding-top: 30px;
                  }

                  .meta-block {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                  }

                  .meta-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  }

                  .meta-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                  }

                  .badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f0fdf4;
                    color: #16a34a;
                    padding: 12px 24px;
                    border-radius: 99px;
                    font-weight: 800;
                    font-size: 16px;
                    letter-spacing: 0.05em;
                    border: 1px solid #bbf7d0;
                  }

                  .badge svg {
                    width: 24px;
                    height: 24px;
                  }
                </style>
              </head>
              <body>
                <div class="cert-wrapper">
                  <div class="cert-inner">
                    <div class="accent-line"></div>
                    <div class="watermark">РУНА</div>
                    
                    <div class="content">
                      <div class="header">
                        <div class="logo">${platformName}</div>
                        <h1 class="cert-title">Сертификат</h1>
                      </div>

                      <div class="main-body">
                        <div class="label">Выдан специалисту:</div>
                        <h2 class="user-name">${userName}</h2>
                        
                        <div class="label">За успешное завершение курса:</div>
                        <h3 class="course-title">«${courseTitle}»</h3>
                      </div>

                      <div class="footer">
                        <div class="meta-block">
                          <span class="meta-label">Дата выдачи</span>
                          <span class="meta-value">${date}</span>
                        </div>
                        <div class="meta-block">
                          <span class="meta-label">Номер документа</span>
                          <span class="meta-value">${certNumber}</span>
                        </div>
                        <div class="meta-block">
                          <span class="meta-label">Платформа</span>
                          <span class="meta-value" style="color: #2563eb;">${host}</span>
                        </div>
                        <div class="badge">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          ПОДТВЕРЖДЕНО
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </body>
            </html>
            `;

            await page.setContent(htmlContent, { waitUntil: 'load' });
            await page.evaluate(() => document.fonts.ready);

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true
            });

            await browser.close();
            browser = null;

            const uniqueFileName = `certificates/${crypto.randomUUID()}-cert.pdf`;

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: uniqueFileName,
                Body: Buffer.from(pdfBuffer),
                ContentType: "application/pdf",
                ACL: 'public-read',
            });

            await s3Client.send(command);

            pdfUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${uniqueFileName}`;

            await prisma.certificate.update({
                where: { id: certificateId },
                data: { pdf_url: pdfUrl }
            });
        }

        await resend.emails.send({
            from: `${platformName} <${process.env.RESEND_FROM_EMAIL}>`,
            to: certificate.user.email,
            subject: `Ваш именной сертификат | ${platformName}`,
            attachments: [
                {
                    filename: `Сертификат_${certificate.course.title.replace(/\s+/g, '_')}.pdf`,
                    path: pdfUrl,
                },
            ],
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #1e3a8a;">Поздравляем с успешным окончанием курса!</h2>
                    </div>
                    <p>Здравствуйте, <strong>${certificate.user.first_name} ${certificate.user.last_name}</strong>!</p>
                    <p>Вы успешно сдали все тесты и завершили курс <strong>«${certificate.course.title}»</strong>.</p>
                    <p>Ваш именной сертификат официально зарегистрирован и прикреплен к этому письму.</p>
                    <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">С уважением, команда ${platformName}.</p>
                </div>
            `,
        });

        return NextResponse.json({ message: "Успешно", url: pdfUrl }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}