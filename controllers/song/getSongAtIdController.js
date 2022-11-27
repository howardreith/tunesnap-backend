import { getSongAtId } from '../../services/songService.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function getSongAtIdController(app) {
  app.get('/songs/:id', async (req, res) => {
    const { id: songId } = req.params;
    const { id: userId } = decodeToken(req.headers.authorization);
    getSongAtId(songId, userId).then((response) => {
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
