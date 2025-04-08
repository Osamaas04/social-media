import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";

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

        const result = await SocialIntegrations.updateOne(
            { "platform_data.facebook.page_id": page_id },
            {
                $set: { "platform_data.facebook": {} }, 
            }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { error: "Page not found or already empty" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Facebook platform data cleared successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
