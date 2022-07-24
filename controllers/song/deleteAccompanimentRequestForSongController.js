import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';
import { deleteAccompanimentRequestForSong } from '../../services/songService.js';

export default function deleteAccompanimentRequestForSongController(app) {
  app.post('/song/unrequest', protectEndpoint, async (req, res) => {
    const { id } = decodeToken(req.headers.authorization);
    const songData = req.body;
    deleteAccompanimentRequestForSong(songData, id).then((response) => {
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
