import { getAccompanimentAtId } from '../../services/accompanimentService.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function getSongAtIdController(app) {
  app.get('/accompaniments/:id', async (req, res) => {
    const { id: accompanimentId } = req.params;
    getAccompanimentAtId(accompanimentId).then((response) => {
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
