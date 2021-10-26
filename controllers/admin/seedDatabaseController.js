import { seedDb } from '../../services/adminService.js';

export default function seedDatabaseController(app) {
  app.get('/admin/seedDb', async (req, res) => {
    try {
      const response = await seedDb();
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
