import { updatePassword } from '../../services/userService.js';
import protectEndpoint from '../../utils/authMiddleware.js';
import { decodeToken } from '../../utils/authHelpers.js';

export default function updatePasswordController(app) {
  app.post('/user/updatePassword', protectEndpoint, async (req, res) => {
    const { newPassword } = req.body;
    const { id } = decodeToken(req.headers.authorization);
    updatePassword(newPassword, id).then((response) => {
      res.status(200).send({
        status: 'OK',
        data: response,
      });
    }).catch((err) => {
      res.status(401).send({
        status: 'Invalid Email or Password',
        data: err,
      });
    });
  });
}
