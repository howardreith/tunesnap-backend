import loginController from '../controllers/user/loginController.js';
import registerController from '../controllers/user/registerController.js';
import addAccompanimentToSongController from '../controllers/accompaniment/addAccompanimentToSongController.js';
import getSongAtIdController from '../controllers/song/getSongAtIdController.js';
import createSongController from '../controllers/song/createSongController.js';
import getAllSongsController from '../controllers/song/getAllSongsController.js';
import autocompleteController from '../controllers/song/autocompleteController.js';
import updatePasswordController from '../controllers/user/updatePasswordController.js';
import getAccompanimentByIdController from '../controllers/accompaniment/getAccompanimentByIdController.js';
import getAccompanimentFileByIdController from '../controllers/accompaniment/getAccompanimentFileByIdController.js';
// import seedDatabaseController from '../controllers/admin/seedDatabaseController.js';
// import getSongTitlesController from '../controllers/admin/getSongTitlesController.js';
// import pruneSongsController from '../controllers/admin/pruneSongsController.js';

export default function implementControllers(app) {
  // User Controllers
  loginController(app);
  registerController(app);
  updatePasswordController(app);

  // Accompaniment Controllers
  addAccompanimentToSongController(app);
  getAccompanimentByIdController(app);
  getAccompanimentFileByIdController(app);

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
