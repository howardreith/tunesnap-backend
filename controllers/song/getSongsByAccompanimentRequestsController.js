import { getSongsSortedByNumberOfRequests } from '../../services/songService.js';

export default function getSongsByAccompanimentRequestsController(app) {
  app.get('/songsByRequest', async (req, res) => {
    const {
      page,
      sortByRecency,
    } = req.query;
    getSongsSortedByNumberOfRequests(page, !!sortByRecency).then((response) => {
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
