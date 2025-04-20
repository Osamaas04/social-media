import { NextResponse } from "next/server";

export const getUserIdFromToken = (request) => {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return userId;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
