import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import getSongAtIdController from './controllers/getSongAtIdController.js';
import createSongController from './controllers/createSongController.js';
import getAllSongsController from './controllers/getAllSongsController.js';

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(bodyParser.json());
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true });
const { connection } = mongoose;
connection.once('open', () => {
  // eslint-disable-next-line no-console
  console.info('MongoDB database connection established');
});

// Set up controllers
getSongAtIdController(app);
createSongController(app);
getAllSongsController(app);

http.createServer(app).listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server Started. Listening on *:${port}`);
});
