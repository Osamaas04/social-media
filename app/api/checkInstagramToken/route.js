import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Insta } from "@/model/insta-model";

export const POST = async (request) => {
  try {
    const { instagram_id } = await request.json();

    await dbConnect();

    const insta = await Insta.findOne({ instagram_id });

    if (insta && insta.access_token) {
        return NextResponse.json({ isConnected: true });
      }
      return NextResponse.json({ isConnected: false });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}