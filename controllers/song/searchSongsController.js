import { getSongViaAutocomplete } from '../../services/songService.js';

export default function searchSongsController(app) {
  app.get('/search', async (req, res) => {
    const {
      titleSearchValue, composerSearchValue, songSetSearchValue, sortBy, page,
    } = req.query;
    getSongViaAutocomplete({
      titleSearchValue, composerSearchValue, songSetSearchValue, sortBy, page,
    }).then((response) => {
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
