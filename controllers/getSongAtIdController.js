import { getSongAtId } from '../services/songService.js';

export default function getSongAtIdController(app) {
  app.get('/songs/:id', async (req, res) => {
    const { id } = req.params;
    getSongAtId(id).then((response) => {
      res.send({
        status: 'OK',
        data: response,
      });
    });
  });
}
