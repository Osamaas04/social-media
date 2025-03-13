import { dbConnect } from "@/lib/mongo";
import { Page } from "@/model/page-model";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { page_id, isActive } = body;

        if (typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Invalid isActive value" }, { status: 400 });
        }

        await dbConnect();
        const page = await Page.findOne({ page_id });

        if (!page) {
            return NextResponse.json({ error: "Page doesn't exist" }, { status: 400 });
        }

        page.isActive = isActive;
        await page.save();

        return NextResponse.json(
            { message: "The status of the activation has been updated", isActive: page.isActive },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to update activation status: ${error.message}` },
            { status: 500 }
        );
    }
}
