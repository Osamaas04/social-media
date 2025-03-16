import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { createWhats } from "@/queries/whatsapp";
import { Page } from "@/model/page-model";

export async function POST(request) {
  try {
    const { page_id } = await request.json();

    await dbConnect();

    const page = await Page.findOne({ page_id });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const { access_token, user_access_token } = page;

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

    await createWhats({
      name,
      phone_number,
      whatsapp_business_account_id: waba,
      phone_number_id,
      user_access_token,
      access_token,
    });

    return NextResponse.json(
      { message: "WABA and phone number ID have stored successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
