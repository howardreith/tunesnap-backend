import { getAccompanimentFileAtId } from '../../services/accompanimentService.js';
import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function getSongAtIdController(app) {
  app.get('/accompaniments/files/:id', protectEndpoint, async (req, res) => {
    const { id: accompanimentId } = req.params;
    const { id: userId } = decodeToken(req.headers.authorization);
    getAccompanimentFileAtId(accompanimentId, userId, res)
      .catch((e) => {
        console.error('Error retrieving file at id: ', accompanimentId, e);
      });
  });
}
