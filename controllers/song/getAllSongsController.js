import { getAllSongs } from '../../services/songService.js';

export default function getAllSongsController(app) {
  app.get('/songs', async (req, res) => {
    getAllSongs().then((response) => {
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
