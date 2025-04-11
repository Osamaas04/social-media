
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const getUserIdFromToken = () => {
    const cookieHeader = cookies().toString();
    const parsed = cookie.parse(cookieHeader || '');
    const token = parsed.token;

    if (!token) {
        throw new Error("Missing authentication token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.user_id;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};
