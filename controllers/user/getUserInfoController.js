import { getUserInfo } from '../../services/userService.js';
import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function getUserInfoController(app) {
  app.get('/user/info', protectEndpoint, async (req, res) => {
    const { id } = decodeToken(req.headers.authorization);
    getUserInfo(id).then((response) => {
      res.status(200).send({
        status: 'OK',
        data: response,
      });
    }).catch((err) => {
      res.status(401).send({
        status: 'Invalid Email or Password',
        data: err,
      });
    });
  });
}
