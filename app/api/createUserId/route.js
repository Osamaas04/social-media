import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { createSocialIntegrations } from "@/queries/sociaIntegration";
import { SocialIntegrations } from "@/model/sociaIntegration-model";

export async function POST(request) {
    try {
        const { user_id, name, company_name } = await request.json();
        if (!user_id) {
            return NextResponse.json(
                { error: "Missing User ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingUser = await SocialIntegrations.findOne({ user_id });
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        await createSocialIntegrations({ user_id, name, company_name })

        return NextResponse.json(
            { message: "User has been created successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}