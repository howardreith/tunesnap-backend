import { createAccompaniment } from '../services/accompanimentService.js';

export default function addAccompanimentToSongController(app) {
  app.post('/accompaniment/create', async (req, res) => {
    const accompanimentData = req.body;
    createAccompaniment(accompanimentData).then((response) => {
      res.send({
        status: 'OK',
        data: response,
      });
    });
  });
}
