import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { createPage } from "@/queries/pages";
import { Page } from "@/model/page-model";

export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code)
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );

    const userAccessTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}?menu=Integrations&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
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

    const pageAccessTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
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

    if (!data.length)
      return NextResponse.json({ error: "No pages found" }, { status: 400 });

    const { name: page_name, id: page_id, access_token } = data[0];

    const existingPage = await Page.findOne({ page_id });
    if (existingPage) {
      if (existingPage)
        return NextResponse.json(
          { error: "Page already exists" },
          { status: 400 }
        );
    }

    await createPage({ page_name, page_id, access_token });

    return NextResponse.json(
      { message: "Page access token stored successfully", page_id },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
