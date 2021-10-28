import { pruneSongs } from '../../services/adminService.js';

export default function pruneSongsController(app) {
  app.get('/admin/pruneSongs', async (req, res) => {
    try {
      const response = await pruneSongs();
      res.status(200).send({
        status: 'OK',
        data: response,
      });
    } catch (err) {
      res.status(400).send({
        status: 'Bad Request',
        data: err,
      });
    }
  });
}
