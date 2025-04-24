import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";

export const POST = async (request) => {
  try {
    const { platform } = await request.json();
    const user_id = getUserIdFromToken(request);

    const validPlatforms = ['facebook', 'instagram', 'whatsapp'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    await dbConnect();

    const platformData = await SocialIntegrations.findOne({ user_id });

    if (!platformData) {
      return NextResponse.json({ isConnected: false });
    }

    const { facebook, instagram, whatsapp } = platformData.platform_data || {};

    if (platform === 'facebook' && facebook?.page_id) {
      return NextResponse.json({
        isConnected: true,
        page_id: facebook.page_id,
        page_name: facebook.page_name || "Facebook Page",
      });
    }

    if (platform === 'instagram' && instagram?.ig_business_id) {
      return NextResponse.json({
        isConnected: true,
        page_id: instagram.ig_business_id,
        page_name: instagram.username || "Instagram Account",
      });
    }

    if (platform === 'whatsapp' && whatsapp?.business_account_id) {
      return NextResponse.json({
        isConnected: true,
        page_id: whatsapp.business_account_id,
        page_name: whatsapp.verified_name || "WhatsApp Business",
      });
    }

    return NextResponse.json({ isConnected: false });
  } catch (error) {
    console.error("CheckToken error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
