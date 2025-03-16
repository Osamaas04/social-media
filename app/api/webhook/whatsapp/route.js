import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { dbConnect } from "@/lib/mongo";
import { Whats } from "@/model/whatsapp-model";

export async function GET(request) {
  try {
    const VERIFY_TOKEN = "my_secret_verify_token_456";
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const entries = body.entry;

    await dbConnect();

    for (const entry of entries) {
      const wabaId = entry.id;
      
      for (const change of entry.changes) {
        const value = change.value;

        const messageData = value.messages[0];
        const senderId = messageData.from;
        const recipientId = value.metadata.phone_number_id;
        const messageId = messageData.id;
        const messageContent = messageData.text?.body || "";
        const createdTime = new Date(parseInt(messageData.timestamp) * 1000).toISOString();

        const whats = await Whats.findOne({ whatsapp_business_account_id: wabaId });

        if (!whats) {
          console.warn(`WhatsApp Business Account ${wabaId} not found. Ignoring message.`);
          continue;
        }

        if (!whats.isActive) {
          console.log(`Skipping message because WABA ${wabaId} is inactive.`);
          continue;
        }

        await redis.lpush("message_queue", JSON.stringify({
          platform: "WhatsApp",
          whatsapp_business_account_id: wabaId,
          message_id: messageId,
          sender_id: senderId,
          recipient_id: recipientId,
          message: messageContent,
          created_time: createdTime,
          page_access_token: whats.access_token,
        }));
      }
    }

    return NextResponse.json(
      { message: "Message has been queued successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error(`Failed to queue message: ${error.message}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}