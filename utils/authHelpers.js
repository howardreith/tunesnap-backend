import jwt from 'jsonwebtoken';

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '60m' });
}

export function decodeToken(token) {
  let parsedToken = token;
  if (parsedToken.startsWith('Bearer ')) {
    parsedToken = parsedToken.replace('Bearer ', '');
  }
  if (!parsedToken || ['null', 'undefined'].includes(parsedToken)) {
    return { id: null };
  }
  return jwt.decode(parsedToken);
}
