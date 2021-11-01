import { createAccompaniment } from '../../services/accompanimentService.js';
import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function addAccompanimentToSongController(app) {
  app.post('/accompaniment/create', protectEndpoint, async (req, res) => {
    const accompanimentData = req.body;
    const { id } = decodeToken(req.headers.authorization);
    createAccompaniment(accompanimentData, id).then((response) => {
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
