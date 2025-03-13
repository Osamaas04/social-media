import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { Page } from "@/model/page-model";

export const POST = async (request) => {
  try {
    const { page_id } = await request.json();

    await dbConnect();

    const page = await Page.findOne({ page_id });

    if (page && page.access_token) {
        return NextResponse.json({ isConnected: true });
      }
      return NextResponse.json({ isConnected: false });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}