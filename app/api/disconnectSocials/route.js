import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

export async function POST(request) {
    try {
        const user_id = getUserIdFromToken(request);
        const { platform, id } = await request.json();

        if (!platform || !id) {
            return NextResponse.json(
                { error: "Missing platform or ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        let update = {};

        switch (platform) {
            case 'facebook':
                update = {
                    $set: {
                        "platform_data.facebook": {
                            page_name: null,
                            page_id: null,
                            status: "inactive",
                            connected_at: null
                        },
                        "token_info.page_access_token": null,
                        "token_info.user_access_token": null
                    }
                };
                break;

            case 'instagram':
                update = {
                    $set: {
                        "platform_data.instagram": {
                            ig_business_id: null,
                            status: "inactive",
                            connected_at: null
                        }
                    }
                };
                break;

            case 'whatsapp':
                update = {
                    $set: {
                        "platform_data.whatsapp": {
                            verified_name: null,
                            business_phone_number: null,
                            business_account_id: null,
                            phone_number_id: null,
                            status: "inactive",
                            connected_at: null
                        }
                    }
                };
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid platform" },
                    { status: 400 }
                );
        }

        const result = await SocialIntegrations.updateOne(user_id, update);

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { error: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected and data deleted successfully` },
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
