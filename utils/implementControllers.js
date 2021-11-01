import loginController from '../controllers/user/loginController.js';
import registerController from '../controllers/user/registerController.js';
import addAccompanimentToSongController from '../controllers/accompaniment/addAccompanimentToSong.js';
import getSongAtIdController from '../controllers/song/getSongAtIdController.js';
import createSongController from '../controllers/song/createSongController.js';
import getAllSongsController from '../controllers/song/getAllSongsController.js';
import autocompleteController from '../controllers/song/autocompleteController.js';
// import seedDatabaseController from '../controllers/admin/seedDatabaseController.js';
// import getSongTitlesController from '../controllers/admin/getSongTitlesController.js';
// import pruneSongsController from '../controllers/admin/pruneSongsController.js';

export default function implementControllers(app) {
  // User Controllers
  loginController(app);
  registerController(app);

  // Accompaniment Controllers
  addAccompanimentToSongController(app);

  // Song Controllers
  getSongAtIdController(app);
  createSongController(app);
  getAllSongsController(app);
  autocompleteController(app);

  // Admin Controllers
  // seedDatabaseController(app);
  // getSongTitlesController(app);
  // pruneSongsController(app);
}
