import { registerUser } from '../../services/userService.js';

export default function registerController(app) {
  app.post('/user/register', async (req, res) => {
    const { email, password, displayName } = req.body;
    registerUser(email, password, displayName).then((response) => {
      res.status(200).send({
        status: 'OK',
        data: response,
      });
    }).catch((err) => {
      res.status(406).send({
        status: 'Invalid Email or Password',
        data: err,
      });
    });
  });
}
