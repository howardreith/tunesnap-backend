import { decodeToken } from '../../utils/authHelpers.js';
import { rateAccompaniment } from '../../services/accompanimentService.js';
import protectEndpoint from '../../utils/authMiddleware.js';

export default function rateAccompanimentController(app) {
  app.post('/accompaniment/rate', protectEndpoint, async (req, res) => {
    const { accompanimentId, rating } = req.body;
    const { id: userId } = decodeToken(req.headers.authorization);
    rateAccompaniment(userId, accompanimentId, rating).then((response) => {
      res.status(200).send({
        status: 'OK',
        data: response,
      });
    }).catch((err) => {
      res.status(400).send({
        status: 'Bad Request',
        data: err,
      });
    });
  });
}
