import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

export async function POST(request) {
  try {
    const user_id = getUserIdFromToken(request)

    await dbConnect();

    const existingIntegration = await SocialIntegrations.findOne({ user_id });

    if (!existingIntegration) {
      return NextResponse.json({ error: "USer not found in user integrations" }, { status: 404 });
    }

    const { page_access_token } = existingIntegration.token_info;
    const { page_id } = existingIntegration.platform_data.facebook;

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

    existingIntegration.platform_data.instagram = {
      ig_business_id: instagram_id,
      connected_at: new Date(),
    };

    await existingIntegration.save();

    return NextResponse.json(
      {
        message: "Instagram account ID has been saved successfully",
        instagramId: instagram_id,
        redirectUrl: "https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=3464406843854023&redirect_uri=https://replix.space/dashboard?menu=Integrations&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights"
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
