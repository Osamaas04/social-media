import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";

export async function POST(request) {
    try {
        const { whatsapp_business_account_id } = await request.json();

        if (!whatsapp_business_account_id) {
            return NextResponse.json(
                { error: "Missing WhatsApp business account ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const result = await SocialIntegrations.updateOne(
            { "platform_data.whatsapp.business_account_id": whatsapp_business_account_id },
            {
                $set: { "platform_data.whatsapp": {} },
            }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { error: "WhatsApp account not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "WhatsApp account deleted successfully" },
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
