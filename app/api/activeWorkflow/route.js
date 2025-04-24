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

    if (
      platformKey === "messenger" &&
      !socialIntegration.platform_data.facebook?.page_id
    ) {
      return NextResponse.json({ error: "Page ID not found" }, { status: 400 });
    }

    if (
      platformKey === "instagram" &&
      !socialIntegration.platform_data.instagram?.instagram_id
    ) {
      return NextResponse.json({ error: "Instagram ID not found" }, { status: 400 });
    }

    if (
      platformKey === "whatsapp" &&
      !socialIntegration.platform_data.whatsapp?.whatsapp_id
    ) {
      return NextResponse.json({ error: "WhatsApp ID not found" }, { status: 400 });
    }

    const statusValue = isActive ? "active" : "inactive";

    switch (platformKey) {
      case "messenger":
        socialIntegration.platform_data.facebook.status = statusValue;
        break;
      case "instagram":
        socialIntegration.platform_data.instagram.status = statusValue;
        break;
      case "whatsapp":
        socialIntegration.platform_data.whatsapp.status = statusValue;
        break;
    }

    await socialIntegration.save();

    return NextResponse.json({ isActive }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update status: ${error.message}` },
      { status: 500 }
    );
  }
}
