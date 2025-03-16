import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Whats } from "@/model/whatsapp-model";

export const POST = async (request) => {
  try {
    const { phone_number_id } = await request.json();

    await dbConnect();

    const whats = await Whats.findOne({ phone_number_id });

    if (whats && whats.access_token && whats.user_access_token) {
        return NextResponse.json({ isConnected: true });
      }
      return NextResponse.json({ isConnected: false });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}