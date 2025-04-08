import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";

export const POST = async (request) => {
  try {
    const { platform, platform_id } = await request.json();

    const validPlatforms = ['facebook', 'instagram', 'whatsapp'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    await dbConnect();

    let query = {};
    if (platform === 'facebook') {
      query = { "platform_data.facebook.page_id": platform_id };
    } else if (platform === 'instagram') {
      query = { "platform_data.instagram.ig_business_id": platform_id };
    } else if (platform === 'whatsapp') {
      query = { "platform_data.whatsapp.business_account_id": platform_id };
    }

    const platformData = await SocialIntegrations.findOne(query);

    if (platform === 'facebook' && platformData?.token_info?.page_access_token) {
      return NextResponse.json({ isConnected: true });
    }
    if (platform === 'instagram' && platformData?.token_info?.user_access_token) {
      return NextResponse.json({ isConnected: true });
    }
    if (platform === 'whatsapp' && platformData?.token_info?.user_access_token) {
      return NextResponse.json({ isConnected: true });
    }

    return NextResponse.json({ isConnected: false });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
