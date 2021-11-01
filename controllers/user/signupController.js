import { signupUser } from '../../services/userService.js';

export default function signupController(app) {
  app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    signupUser(email, password).then((response) => {
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
