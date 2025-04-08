import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";

export async function POST(request) {
    try {
        const { platform, id } = await request.json();

        if (!platform || !id) {
            return NextResponse.json(
                { error: "Missing platform or ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        let platformField;

        switch (platform) {
            case 'facebook':
                platformField = "platform_data.facebook.page_id";
                break;
            case 'instagram':
                platformField = "platform_data.instagram.ig_business_id";
                break;
            case 'whatsapp':
                platformField = "platform_data.whatsapp.business_account_id";
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid platform" },
                    { status: 400 }
                );
        }

        const result = await SocialIntegrations.updateOne(
            { [platformField]: id },
            {
                $set: {
                    [`platform_data.${platform}`]: {}
                },
            }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { error: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account deleted successfully` },
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
