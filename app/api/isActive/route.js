import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const user_id = getUserIdFromToken(request);

    await dbConnect();

    const socialIntegration = await SocialIntegrations.findOne({ user_id });
    if (!socialIntegration) {
      return NextResponse.json(
        { error: "User does not have any social integrations" },
        { status: 400 }
      );
    }

    const platformData = socialIntegration.platform_data;

    const statuses = {
      messenger:
        platformData.facebook?.status === "active" ? true : false,
      instagram:
        platformData.instagram?.status === "active" ? true : false,
      whatsapp:
        platformData.whatsapp?.status === "active" ? true : false,
      x: false, 
    };

    return NextResponse.json(statuses, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch status: ${error.message}` },
      { status: 500 }
    );
  }
}
