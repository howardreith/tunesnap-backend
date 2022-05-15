import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';
import { createSale } from '../../services/saleService.js';

export default function addSaleController(app) {
  app.post('/sale', protectEndpoint, async (req, res) => {
    const { id } = decodeToken(req.headers.authorization);
    const saleData = req.body;
    createSale(saleData, id).then((response) => {
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
