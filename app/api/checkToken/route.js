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

    const platformData = await SocialIntegrations.findOne(user_id);

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
