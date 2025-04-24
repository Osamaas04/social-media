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

    if (platform === 'facebook' && platformData?.platform_data?.facebook?.page_id) {
      return NextResponse.json({ isConnected: true });
    }
    if (platform === 'instagram' && platformData?.platform_data?.instagram?.ig_business_id) {
      return NextResponse.json({ isConnected: true });
    }
    if (platform === 'whatsapp' && platformData?.platform_data?.whatsapp?.business_account_id) {
      return NextResponse.json({ isConnected: true });
    }

    return NextResponse.json({ isConnected: false });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
