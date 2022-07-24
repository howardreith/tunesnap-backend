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
import addAccompanimentToCartController from '../controllers/user/addAccompanimentToCartController.js';
import getCartController from '../controllers/user/getCartController.js';
import removeAccompanimentFromCartController from '../controllers/user/removeAccompanimentFromCartController.js';
import getUserInfoController from '../controllers/user/getUserInfoController.js';
import addSaleController from '../controllers/sale/addSaleController.js';
import addAccompanimentRequestForSongController from '../controllers/song/addAccompanimentRequestForSongController.js';
// import getSongTitlesController from '../controllers/admin/getSongTitlesController.js';
// import pruneSongsController from '../controllers/admin/pruneSongsController.js';
// import seedAriasController from '../controllers/admin/seedAriasController.js';

export default function implementControllers(app) {
  // User Controllers
  loginController(app);
  registerController(app);
  getUserInfoController(app);
  updatePasswordController(app);
  addAccompanimentToCartController(app);
  removeAccompanimentFromCartController(app);
  getCartController(app);

  // Accompaniment Controllers
  addAccompanimentToSongController(app);
  getAccompanimentByIdController(app);
  getAccompanimentFileByIdController(app);

  // Song Controllers
  getSongAtIdController(app);
  createSongController(app);
  getAllSongsController(app);
  autocompleteController(app);
  addAccompanimentRequestForSongController(app);

  // Sale Controllers
  addSaleController(app);

  // Admin Controllers
  // seedAriasController(app);
  // getSongTitlesController(app);
  // pruneSongsController(app);
}
