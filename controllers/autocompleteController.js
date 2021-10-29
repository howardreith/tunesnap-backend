import { getSongViaAutocomplete } from '../services/songService.js';

export default function autocompleteController(app) {
  app.get('/songs/search/:queryString', async (req, res) => {
    const { queryString } = req.params;
    getSongViaAutocomplete(queryString).then((response) => {
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
