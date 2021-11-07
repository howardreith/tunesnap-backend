import { addAccompanimentToCart } from '../../services/userService.js';
import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function addAccompanimentToCartController(app) {
  app.post('/user/addToCart', protectEndpoint, async (req, res) => {
    const { accompanimentId } = req.body;
    const { id } = decodeToken(req.headers.authorization);
    addAccompanimentToCart(accompanimentId, id).then((response) => {
      res.status(200).send({
        status: 'OK',
        data: response,
      });
    }).catch((err) => {
      res.status(400).send({
        status: 'Error updating cart',
        data: err,
      });
    });
  });
}
