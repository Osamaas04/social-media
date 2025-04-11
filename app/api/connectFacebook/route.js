import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

import { SocialIntegrations } from "@/model/sociaIntegration-model";

export async function POST(request) {
  try {

    const { code } = await request.json();


    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    const userAccessTokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}?menu=Integrations&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
    );

    if (!userAccessTokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user access token" },
        { status: 400 }
      );
    }

    const userAccessTokenData = await userAccessTokenResponse.json();
    const userAccessToken = userAccessTokenData.access_token;

    try {
      await dbConnect();
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Error connecting to the database", error);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const longLivedUserAccessTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${userAccessToken}`
    );

    if (!longLivedUserAccessTokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch long-lived user access token" },
        { status: 400 }
      );
    }

    const longLivedUserAccessTokenData = await longLivedUserAccessTokenResponse.json();
    const longLivedUserAccessToken = longLivedUserAccessTokenData.access_token;

    const pageAccessTokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?access_token=${userAccessToken}`
    );

    if (!pageAccessTokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch page access token" },
        { status: 400 }
      );
    }

    const { data } = await pageAccessTokenResponse.json();

    if (!data.length) {
      return NextResponse.json({ error: "No pages found" }, { status: 400 });
    }

    const { name: page_name, id: page_id, access_token } = data[0];

    const existingPage = await SocialIntegrations.findOne({ "platform_data.facebook.page_id": page_id });
    if (existingPage) {
      return NextResponse.json(
        { error: "Page already exists" },
        { status: 400 }
      );
    }

    console.log(existingPage)

    const cookieHeader = request.headers.get("cookie") || "";
    const parsed = cookie.parse(cookieHeader);
    const token = parsed.token;
    const decoded = jwt.decode(token);
    const user_id = decoded.user_id

    console.log(user_id)

    const userIntegration = new SocialIntegrations({
      user_id,
      platform_data: {
        facebook: {
          page_name,
          page_id,
          connected_at: new Date(),
        },
      },
      token_info: {
        user_access_token: longLivedUserAccessToken,
        page_access_token: access_token,
      },
    });

    await userIntegration.save();

    return NextResponse.json(
      { message: "Page access token stored successfully", page_id },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
