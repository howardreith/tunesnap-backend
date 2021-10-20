import { getAllSongs } from '../services/songService.js';

export default function getAllSongsController(app) {
  app.get('/songs', async (req, res) => {
    getAllSongs().then((response) => {
      res.send({
        status: 'OK',
        data: response,
      });
    });
  });
}
