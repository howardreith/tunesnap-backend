import { getAccompanimentFileAtId } from '../../services/accompanimentService.js';
import { protectEndpointIfFileAndNotFree } from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function getSongAtIdController(app) {
  app.get('/accompaniments/files/:id', async (req, res) => {
    const { id: accompanimentId } = req.params;
    const headerToken = req.headers.authorization;
    const token = headerToken.replace('Bearer ', '');
    getAccompanimentFileAtId(accompanimentId, token, res)
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error('Error retrieving file at id: ', accompanimentId, e);
      });
  });
}
