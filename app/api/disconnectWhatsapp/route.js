import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Whats } from "@/model/whatsapp-model";

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

        const result = await Whats.deleteOne({ whatsapp_business_account_id });

        if (result.deletedCount === 0) {
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
