import { dbConnect } from "@/lib/mongo";
import { Insta } from "@/model/insta-model";
import { Page } from "@/model/page-model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { page_id, isActive, platform, instagram_id } = body;

    if (!page_id || !platform || (platform === "Instagram" && !instagram_id)) {
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

    let updatedStatus;

    if (platform === "Messenger") {
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
    } else if (platform === "Instagram") {
      const insta = await Insta.findOne({ instagram_id });
      if (!insta) {
        return NextResponse.json(
          { error: "Insta doesn't exist" },
          { status: 400 }
        );
      }

      insta.isActive = isActive;
      await insta.save();
      updatedStatus = insta.isActive;
    } else {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "The status of the activation has been updated",
        isActive: updatedStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update activation status: ${error.message}` },
      { status: 500 }
    );
  }
}
