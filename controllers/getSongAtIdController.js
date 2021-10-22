import { getSongAtId } from '../services/songService.js';

export default function getSongAtIdController(app) {
  app.get('/songs/:id', async (req, res) => {
    const { id } = req.params;
    getSongAtId(id).then((response) => {
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
