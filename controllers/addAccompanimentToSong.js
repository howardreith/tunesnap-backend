import { createAccompaniment } from '../services/accompanimentService.js';

export default function addAccompanimentToSongController(app) {
  app.post('/accompaniment/create', async (req, res) => {
    const accompanimentData = req.body;
    createAccompaniment(accompanimentData).then((response) => {
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
