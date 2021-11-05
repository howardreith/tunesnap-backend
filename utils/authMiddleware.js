import jwt from 'jsonwebtoken';
import { decodeToken } from './authHelpers.js';
import UserModel from '../models/userModel.js';
import AccompanimentModel from '../models/accompanimentModel.js';

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

export async function protectEndpointIfFileAndNotFree(req, res, next) {
  const { id: accompanimentId } = req.params;
  const bearerToken = req.headers && req.headers.authorization;
  const accompaniment = await AccompanimentModel.findById(accompanimentId);
  if (!accompaniment.file || !accompaniment.price) {
    next();
  } else if (!bearerToken || ['null', 'Bearer null'].includes(bearerToken)) {
    res.status(401).send({ status: 'Unauthorized', data: 'User is not logged in' });
  } else {
    try {
      const token = bearerToken.replace('Bearer ', '');
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Login Failed: ', e);
      res.status(401).send({ status: 'Unauthorized', data: 'Invalid token' });
    }
    const { id: userId } = decodeToken(req.headers.authorization);
    const user = await UserModel.findById(userId).populate('accompanimentsOwned');
    const { accompanimentsOwned } = await user.populate('accompanimentsOwned');
    const accompanimentIds = accompanimentsOwned.map((acc) => acc.accompaniment.toString());
    if (accompanimentIds.includes(accompanimentId.toString())) {
      next();
    } else {
      res.status(401).send({ status: 'Unauthorized', data: `User does not own ${accompanimentId}` });
    }
  }
}
