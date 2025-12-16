import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
    console.log("📌 API /api/upload dipanggil");

    try {
        const form = await req.formData();
        const file = form.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "File harus berupa gambar" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "produk" },
                (err: any, result: unknown) => (err ? reject(err) : resolve(result))
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({ url: uploadResult.secure_url });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Upload failed", details: err.message },
            { status: 500 }
        );
    }
}
