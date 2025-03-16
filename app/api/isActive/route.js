import { dbConnect } from "@/lib/mongo";
import { Insta } from "@/model/insta-model";
import { Page } from "@/model/page-model";
import { Whats } from "@/model/whatsapp-model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    // Destructure whatsapp_id from the request body
    const { page_id, isActive, platform, instagram_id, whatsapp_id } = body;

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

    console.log(whatsapp_id)

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isActive value" },
        { status: 400 }
      );
    }

    await dbConnect();

    let updatedStatus;

    // Handle each platform case
    switch (platform) {
      case "Messenger":
        const page = await Page.findOne({ page_id });
        if (!page) {
          return NextResponse.json(
            { error: "Page doesn't exist" },
            { status: 400 }
          );
        }
        page.isActive = isActive;
        await page.save();
        updatedStatus = page.isActive;
        break;

      case "Instagram":
        const insta = await Insta.findOne({ instagram_id });
        if (!insta) {
          return NextResponse.json(
            { error: "Insta account doesn't exist" },
            { status: 400 }
          );
        }
        insta.isActive = isActive;
        await insta.save();
        updatedStatus = insta.isActive;
        break;

      case "WhatsApp":
        const whats = await Whats.findOne({ whatsapp_id });
        if (!whats) {
          return NextResponse.json(
            { error: "WhatsApp account doesn't exist" },
            { status: 400 }
          );
        }
        whats.isActive = isActive;
        await whats.save();
        updatedStatus = whats.isActive;
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