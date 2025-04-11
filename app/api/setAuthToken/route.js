import { NextResponse } from "next/server";

export const POST = async (request) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 400 });
    }

    const response = NextResponse.json({ message: "User token has been set successfully" }, { status: 200 });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
