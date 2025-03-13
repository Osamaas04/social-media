import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Page } from "@/model/page-model";

export async function POST(request) {
    try {
        const { page_id } = await request.json();

        if (!page_id) {
            return NextResponse.json(
                { error: "Missing page ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const result = await Page.deleteOne({ page_id });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Page not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Page deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Disconnect error:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
