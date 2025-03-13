import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Page } from "@/model/page-model";

export async function POST(request) {
  try {
    const { page_id } = await request.json();

    await dbConnect();

    const page = await Page.findOne({ page_id });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const { access_token } = page;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${page_id}?fields=instagram_business_account&access_token=${access_token}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Instagram account ID" },
        { status: 400 }
      );
    }

    const data = await response.json();

    if (!data.instagram_business_account || !data.instagram_business_account.id) {
      return NextResponse.json(
        { error: "No Instagram business account linked to this page" },
        { status: 404 }
      );
    }

    const instagram_id = data.instagram_business_account.id;
    page.instagram_id = instagram_id;
    await page.save();

    return NextResponse.json(
      { message: "Instagram account ID has been saved successfully", instagramId: instagram_id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error connecting Instagram: ${error.message}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
