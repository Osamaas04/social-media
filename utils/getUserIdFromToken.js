import jwt from 'jsonwebtoken';

export const getUserIdFromToken = (request) => {
  const cookie = request.headers.get('cookie') || '';
  const token = cookie
    .split(';')
    .find(c => c.trim().startsWith('token='))
    ?.split('=')[1];

    console.log(token)

  if (!token) {
    throw new Error('Unauthorized: No token');
  }

  const decoded = jwt.decode(token);

  console.log(decoded)
  console.log(decoded.sub)

  if (!decoded || !decoded.sub) {
    throw new Error('Unauthorized: Invalid token');
  }

  return decoded.sub;
};
