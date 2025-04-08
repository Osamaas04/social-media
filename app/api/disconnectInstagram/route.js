import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";

export async function POST(request) {
    try {
        const { instagram_id } = await request.json();

        if (!instagram_id) {
            return NextResponse.json(
                { error: "Missing page ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const result = await SocialIntegrations.updateOne(
            { "platform_data.instagram.ig_business_id": instagram_id },
            {
                $set: { "platform_data.instagram": {} },
            }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { error: "Instagram account not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Instagram account deleted successfully" },
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
