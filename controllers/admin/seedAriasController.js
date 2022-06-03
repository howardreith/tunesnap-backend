// import { seedDbWithArias } from '../../services/adminService.js';
//
// export default function seedAriasController(app) {
//   app.get('/admin/seedArias', async (req, res) => {
//     try {
//       const response = await seedDbWithArias();
//       res.status(200).send({
//         status: 'OK',
//         data: response,
//       });
//     } catch (err) {
//       res.status(400).send({
//         status: 'Bad Request',
//         data: err,
//       });
//     }
//   });
// }
