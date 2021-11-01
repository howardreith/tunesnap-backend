import jwt from 'jsonwebtoken';

export default function protectEndpoint(req, res, next) {
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    res.status(401)
      .send({ status: 'Unauthorized', data: 'No token included in request' });
  } else if (bearerToken && bearerToken.startsWith('Bearer')) {
    try {
      const token = bearerToken.replace('Bearer ', '');
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Login Failed: ', e);
      res.status(401).send({ status: 'Unauthorized', data: 'Invalid token' });
    }
  }
}
