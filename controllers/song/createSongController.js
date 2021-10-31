import { createSong } from '../../services/songService.js';

export default function createSongController(app) {
  app.post('/songs/create', async (req, res) => {
    const song = req.body;
    createSong(song).then((response) => {
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
