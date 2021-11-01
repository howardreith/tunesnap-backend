import { loginUser } from '../../services/userService.js';

export default function loginController(app) {
  app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    loginUser(email, password).then((response) => {
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
