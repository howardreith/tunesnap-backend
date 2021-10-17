import createSong from '../services/createSong.js';

export default function createSongController(app) {
  app.post('/songs/create', async (req, res) => {
    const song = req.body;
    createSong(song).then((response) => {
      console.log('===> res', response);
      res.send({
        state: 'OK',
        data: res,
      });
    });
  });
}
