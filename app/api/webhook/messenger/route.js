import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { dbConnect } from "@/lib/mongo";
import { Page } from "@/model/page-model";
import sql from "mssql";
import { getConnection } from "@/lib/sql";

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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const entries = body.entry;

    await dbConnect();

    let message;
    let messageId;
    let recipientId;
    let senderId;
    let timestamp;

    for (const entry of entries) {
      const messagingEvents = entry.messaging;

      for (const event of messagingEvents) {
        message = event.message?.text || "";
        messageId = event.message?.mid; 
        senderId = event.sender.id;
        recipientId = event.recipient.id;
        timestamp = event.timestamp ? new Date(event.timestamp) : new Date();
      }
    }

    const page = await Page.findOne({ page_id: recipientId });

    if (!page) {
      console.warn(
        `Page ${recipientId} not found. Ignoring message from ${senderId}.`
      );
      return NextResponse.json(
        { message: "Page not found, ignoring message" },
        { status: 404 }
      );
    }

    if (!page.isActive) {
      console.log(
        `Skipping message from ${senderId} because page ${recipientId} is inactive.`
      );
      return NextResponse.json(
        { message: "Page is inactive, message ignored" },
        { status: 200 }
      );
    }

    const pool = await getConnection();
    const sqlRequest = pool.request();

    console.log(process.env.SQL_SERVER)

    sqlRequest.input("SenderId", sql.NVarChar(255), senderId);
    sqlRequest.input("RecipientId", sql.NVarChar(255), recipientId);
    sqlRequest.input("MessageId", sql.NVarChar(1000), messageId);
    sqlRequest.input("Message", sql.NVarChar(1000), message);
    sqlRequest.input("PageAccessTocken", sql.NVarChar(sql.MAX), page.access_token);
    sqlRequest.input("Status", sql.Int, 1); 
    sqlRequest.input("CreateAt", sql.DateTime2, new Date()); 
    sqlRequest.input("SentAt", sql.DateTime2, timestamp);
    sqlRequest.input("Platform", sql.NVarChar(1), "F"); 

    await sqlRequest.query(`
      INSERT INTO Messages (
        Id, SenderId, RecipientId, MessageId, Message, PageAccessTocken, 
        Status, CreateAt, SentAt, Platform
      ) 
      VALUES (
        NEWID(), @SenderId, @RecipientId, @MessageId, @Message, 
        @PageAccessTocken, @Status, @CreateAt, @SentAt, @Platform
      )
    `);

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