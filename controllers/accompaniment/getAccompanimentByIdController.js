import { getAccompanimentAtId } from '../../services/accompanimentService.js';

export default function getAccompanimentAtIdController(app) {
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
