import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Insta } from "@/model/insta-model";

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

        const result = await Insta.deleteOne({ instagram_id });

        if (result.deletedCount === 0) {
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
