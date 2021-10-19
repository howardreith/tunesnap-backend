import { getSongAtId } from '../services/songService.js';

export default function getSongAtIdController(app) {
  app.get('/songs/:id', async (req, res) => {
    const id = req.params.hash;
    getSongAtId(id).then((response) => {
      console.log('===> res', response);
      res.send({
        state: 'OK',
        data: res,
      });
    });
  });
}
