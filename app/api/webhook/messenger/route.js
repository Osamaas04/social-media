import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import { SocialIntegrations } from "@/model/sociaIntegration-model";
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

    const page = await SocialIntegrations.findOne({ "platform_data.facebook.page_id": recipientId });

    if (!page) {
      console.warn(
        `Page ${recipientId} not found. Ignoring message from ${senderId}.`
      );
      return NextResponse.json(
        { message: "Page not found, ignoring message" },
        { status: 404 }
      );
    }

    if (page.platform_data.facebook.status === "inactive") {
      console.log(
        `Skipping message from ${senderId} because page ${recipientId} is inactive.`
      );
      return NextResponse.json(
        { message: "Page is inactive, message ignored" },
        { status: 200 }
      );
    }

    const userInfoResponse = await fetch(
      `https://graph.facebook.com/${senderId}?fields=first_name,last_name,profile_pic&access_token=${page.token_info.page_access_token}`
    );

    const userInfo = await userInfoResponse.json();
    const fullName = `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim();
    const profilePic = userInfo.profile_pic || "";

    const pool = await getConnection();
    const sqlRequest = pool.request();

    const casePrefix = "F";
    const caseQuery = await sqlRequest.query(`
      SELECT TOP 1 CaseNumber 
      FROM Messages 
      WHERE CaseNumber LIKE '${casePrefix}%' 
      ORDER BY CreateAt DESC
    `);

    let nextCaseNumber = `${casePrefix}00001`;

    if (caseQuery.recordset.length > 0) {
      const lastCase = caseQuery.recordset[0].CaseNumber;
      const lastNumber = parseInt(lastCase.slice(1), 10);
      const nextNumber = lastNumber + 1;
      nextCaseNumber = `${casePrefix}${nextNumber.toString().padStart(5, "0")}`;
    }


    sqlRequest.input("SenderId", sql.NVarChar(255), senderId);
    sqlRequest.input("RecipientId", sql.NVarChar(255), recipientId);
    sqlRequest.input("MessageId", sql.NVarChar(255), messageId);
    sqlRequest.input("Text", sql.NVarChar(1000), message);
    sqlRequest.input("PageAccessToken", sql.NVarChar(255), page.token_info.page_access_token);
    sqlRequest.input("Status", sql.Int, 0);
    sqlRequest.input("CreateAt", sql.DateTime2, new Date());
    sqlRequest.input("SentAt", sql.DateTime2, timestamp);
    sqlRequest.input("Platform", sql.NVarChar(1), "F");
    sqlRequest.input("UserId", sql.NVarChar(255), page.user_id);
    sqlRequest.input("FullName", sql.NVarChar(255), fullName);
    sqlRequest.input("ProfilePic", sql.NVarChar(1000), profilePic);
    sqlRequest.input("CaseNumber", sql.NVarChar(10), nextCaseNumber);


    await sqlRequest.query(`
      INSERT INTO Messages (
          Id, SenderId, RecipientId, MessageId, Text, PageAccessToken, 
          Status, CreateAt, SentAt, Platform, UserId,
          FullName, ProfilePic, CaseNumber
      )  VALUES (
          NEWID(), @SenderId, @RecipientId, @MessageId, @Text, 
          @PageAccessToken, @Status, @CreateAt, @SentAt, @Platform, @UserId,
          @FullName, @ProfilePic, @CaseNumber
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