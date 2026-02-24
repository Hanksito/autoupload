import { NextRequest, NextResponse } from "next/server";
import { uploadVideo } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const allowedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/mov"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only MP4, MOV, WebM videos are allowed." },
                { status: 400 }
            );
        }

        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 500MB." },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { url, publicId } = await uploadVideo(buffer, file.name);

        return NextResponse.json({ url, publicId });
    } catch (error) {
        console.error("POST /api/upload error:", error);
        return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
