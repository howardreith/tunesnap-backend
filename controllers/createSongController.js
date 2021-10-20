import { createSong } from '../services/songService.js';

export default function createSongController(app) {
  app.post('/songs/create', async (req, res) => {
    const song = req.body;
    createSong(song).then((response) => {
      res.send({
        status: 'OK',
        data: response,
      });
    });
  });
}
