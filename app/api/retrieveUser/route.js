import { getUserIdFromToken } from "@/utils/getUserIdFromToken";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";

export async function GET(request) {
  try {
    const user_id  = getUserIdFromToken(request);

    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized: User token not found" }, { status: 401 });
    }

    await dbConnect();

    const user = await SocialIntegrations.findOne({ user_id });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, company_name, email } = user;

    return NextResponse.json({ name, company_name, email }, { status: 200 });

  } catch (error) {
    console.error("Error retrieving user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
