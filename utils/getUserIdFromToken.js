import jwt from 'jsonwebtoken';

export const getUserIdFromToken = (request) => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not defined in environment variables");
    throw new Error("Server configuration error");
  }

  console.log(request)

  const scHeader = request.headers.get('x-vercel-sc-headers');
  if (!scHeader) {
    console.error("❌ Missing x-vercel-sc-headers header");
    throw new Error("Missing authentication header");
  }

  let token;
  try {
    const parsedHeaders = JSON.parse(scHeader);
    const authHeader = parsedHeaders.Authorization || parsedHeaders.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  } catch (err) {
    console.error("❌ Failed to parse x-vercel-sc-headers:", err.message);
    throw new Error("Malformed authentication header");
  }

  if (!token) {
    console.error("❌ No token found in Authorization header");
    throw new Error("Missing authentication token");
  }

  try {
    const decoded = jwt.decode(token);
    console.log(decoded)
    return decoded.uid;
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    throw new Error("Invalid or expired token");
  }
};
