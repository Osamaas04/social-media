import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const getUserIdFromToken = (request) => {
  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not defined in environment variables");
    throw new Error("Server configuration error");
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const parsed = cookie.parse(cookieHeader);
  const token = parsed.token;

  if (!token) {
    console.error("❌ No token found in cookies");
    throw new Error("Missing authentication token");
  }

  try {
    const decoded = jwt.decode(token);
    return decoded.uid;
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    throw new Error("Invalid or expired token");
  }
};