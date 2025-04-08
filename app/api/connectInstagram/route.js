import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model"; 

export async function POST(request) {
  try {
    const { page_id } = await request.json(); 

    if (!page_id) {
      return NextResponse.json(
        { error: "Missing page_id" },
        { status: 400 }
      );
    }

    await dbConnect();

    const userIntegration = await SocialIntegrations.findOne({
      "platform_data.facebook.page_id": page_id,
    });

    if (!userIntegration) {
      return NextResponse.json({ error: "Page not found in user integrations" }, { status: 404 });
    }

    const { page_access_token } = userIntegration.token_info; 

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${page_id}?fields=instagram_business_account&access_token=${page_access_token}`,
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

    if (
      !data.instagram_business_account ||
      !data.instagram_business_account.id
    ) {
      return NextResponse.json(
        { error: "No Instagram business account linked to this page" },
        { status: 404 }
      );
    }

    const instagram_id = data.instagram_business_account.id;

    userIntegration.platform_data.instagram = {
      ig_business_id: instagram_id,
      connected_at: new Date(), 
    };

    await userIntegration.save();

    return NextResponse.json(
      {
        message: "Instagram account ID has been saved successfully",
        instagramId: instagram_id,
      },
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
