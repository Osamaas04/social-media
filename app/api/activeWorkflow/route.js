import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const user_id = getUserIdFromToken(request);
    const { platform, isActive } = await request.json();

    if (!platform || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    await dbConnect();

    const socialIntegration = await SocialIntegrations.findOne({ user_id });
    if (!socialIntegration) {
      return NextResponse.json(
        { error: "User does not have any social integrations" },
        { status: 400 }
      );
    }

    const platformKey = platform.toLowerCase();

    // Check for missing platform ID
    if (
      platformKey === "messenger" &&
      !socialIntegration.platform_data.facebook?.page_id
    ) {
      return NextResponse.json(
        { error: "Page ID not found" },
        { status: 400 }
      );
    }

    if (
      platformKey === "instagram" &&
      !socialIntegration.platform_data.instagram?.instagram_id
    ) {
      return NextResponse.json(
        { error: "Instagram ID not found" },
        { status: 400 }
      );
    }

    if (
      platformKey === "whatsapp" &&
      !socialIntegration.platform_data.whatsapp?.whatsapp_id
    ) {
      return NextResponse.json(
        { error: "WhatsApp ID not found" },
        { status: 400 }
      );
    }

    // Update the platform's status
    const updateField = `platform_data.${platformKey}.status`;
    await SocialIntegrations.updateOne(
      { user_id },
      { $set: { [updateField]: isActive ? "active" : "inactive" } }
    );

    return NextResponse.json({ isActive }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update status: ${error.message}` },
      { status: 500 }
    );
  }
}
