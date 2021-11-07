import { getCart } from '../../services/userService.js';
import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function getSongAtIdController(app) {
  app.get('/user/cart', protectEndpoint, async (req, res) => {
    const { id } = decodeToken(req.headers.authorization);
    getCart(id).then((response) => {
      res.status(200).send({
        status: 'OK',
        data: response,
      });
    }).catch((err) => {
      res.status(404).send({
        status: 'Not Found',
        data: err,
      });
    });
  });
}
