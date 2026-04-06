import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.S3_REGION || "ru-1",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "File required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueFileName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, '_')}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: file.type,
            ACL: 'public-read',
        });

        await s3Client.send(command);

        const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${uniqueFileName}`;

        return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}