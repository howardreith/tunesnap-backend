import multer from 'multer';
import { createAccompaniment } from '../../services/accompanimentService.js';
import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

const multerUpload = multer({ dest: '/tmp' });

export default function addAccompanimentToSongController(app) {
  app.post('/accompaniment/create', protectEndpoint, multerUpload.single('file'), async (req, res) => {
    const { id } = decodeToken(req.headers.authorization);
    const accompanimentData = req.body;
    const fileToUpload = req.file;
    createAccompaniment(accompanimentData, id, fileToUpload).then((response) => {
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
