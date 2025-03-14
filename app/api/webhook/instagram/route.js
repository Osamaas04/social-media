import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { dbConnect } from "@/lib/mongo";
import { Insta } from "@/model/insta-model";

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
      const messagingEvents = entry.messaging;
      
      for (const event of messagingEvents) {
        const message = event.message;
        const senderId = event.sender.id;
        const recipientId = event.recipient.id;
        const timestamp = event.timestamp;

        // Fetch page details
        const insta = await Insta.findOne({ page_id: recipientId });

        // If page doesn't exist or is inactive, skip processing
        // if (!page) {
        //   console.warn(`Page ${recipientId} not found. Ignoring message from ${senderId}.`);
        //   continue;
        // }

        // if (!page.isActive) {
        //   console.log(`Skipping message from ${senderId} because page ${recipientId} is inactive.`);
        //   continue;
        // }

        // Push message to Redis queue
        await redis.lpush("message_queue", JSON.stringify({
          message_id: message?.mid || null,
          sender_id: senderId,
          recipient_id: recipientId,
          text: message?.text || "",
          sent_time: new Date(timestamp).toISOString(),
          page_access_token: insta.access_token,
        }));
      }
    }

    return NextResponse.json(
      { message: "Message has been queued successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error(`Failed to queue the message: ${error.message}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
