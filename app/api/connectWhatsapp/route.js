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

    const { user_access_token } = existingIntegration.token_info;

    const businessIdResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/businesses?access_token=${user_access_token}`
    );

    if (!businessIdResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch business ID" },
        { status: 400 }
      );
    }

    const businessIdData = await businessIdResponse.json();
    const business_id = businessIdData.data[0].id;

    const wabaResponse = await fetch(
      `https://graph.facebook.com/v22.0/${business_id}/owned_whatsapp_business_accounts?access_token=${user_access_token}`
    );

    if (!wabaResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch WABA" },
        { status: 400 }
      );
    }

    const wabaData = await wabaResponse.json();
    const waba = wabaData.data[0].id;

    const phoneNumberIdResponse = await fetch(
      `https://graph.facebook.com/v22.0/${waba}/phone_numbers?access_token=${user_access_token}`
    );

    if (!phoneNumberIdResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch phone number ID" },
        { status: 400 }
      );
    }

    const phoneNumberIdData = await phoneNumberIdResponse.json();
    const phone_number_id = phoneNumberIdData.data[0].id;
    const name = phoneNumberIdData.data[0].verified_name;
    const phone_number = phoneNumberIdData.data[0].display_phone_number;

    existingIntegration.platform_data.whatsapp = {
      verified_name: name,
      business_phone_number: phone_number,
      business_account_id: waba,
      phone_number_id,
      connected_at: new Date(), 
    };

    await existingIntegration.save();

    return NextResponse.json(
      { message: "Phone number ID have stored successfully", whatsappId: waba },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
