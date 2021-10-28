import { getSongTitles } from '../../services/adminService.js';

export default function getSongTitlesController(app) {
  app.get('/admin/getSongTitles', async (req, res) => {
    try {
      const response = await getSongTitles();
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
