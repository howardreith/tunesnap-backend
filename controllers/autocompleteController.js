import { getSongViaAutocomplete } from '../services/songService.js';

export default function autocompleteController(app) {
  app.post('/songs/search', async (req, res) => {
    const { queryString, sortBy, page } = req.body;
    getSongViaAutocomplete(queryString, sortBy, page).then((response) => {
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
