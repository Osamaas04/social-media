import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/social-integrations"; // Assuming this is the correct import path
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    // Destructure the necessary fields from the request body
    const { user_id, isActive, platform, instagram_id, whatsapp_id, page_id } = body;

    // Validate required fields based on platform
    if (
      !platform ||
      (platform === "Messenger" && !page_id) ||
      (platform === "Instagram" && !instagram_id) ||
      (platform === "WhatsApp" && !whatsapp_id)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isActive value" },
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

    let updatedStatus;
    const platformData = socialIntegration.platform_data;

    switch (platform) {
      case "Messenger":
        if (!platformData.facebook || platformData.facebook.page_id !== page_id) {
          return NextResponse.json(
            { error: "Page doesn't exist or mismatch" },
            { status: 400 }
          );
        }
        platformData.facebook.status = isActive ? "active" : "inactive";
        await socialIntegration.save();
        updatedStatus = platformData.facebook.status;
        break;

      case "Instagram":
        if (!platformData.instagram || platformData.instagram.ig_business_id !== instagram_id) {
          return NextResponse.json(
            { error: "Instagram account doesn't exist or mismatch" },
            { status: 400 }
          );
        }
        platformData.instagram.status = isActive ? "active" : "inactive";
        await socialIntegration.save();
        updatedStatus = platformData.instagram.status;
        break;

      case "WhatsApp":
        if (!platformData.whatsapp || platformData.whatsapp.business_account_id !== whatsapp_id) {
          return NextResponse.json(
            { error: "WhatsApp account doesn't exist or mismatch" },
            { status: 400 }
          );
        }
        platformData.whatsapp.status = isActive ? "active" : "inactive";
        await socialIntegration.save();
        updatedStatus = platformData.whatsapp.status;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid platform" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        message: "Activation status updated successfully",
        isActive: updatedStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update status: ${error.message}` },
      { status: 500 }
    );
  }
}
