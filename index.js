import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import getSongAtIdController from './controllers/getSongAtIdController.js';
import createSongController from './controllers/createSongController.js';
import getAllSongsController from './controllers/getAllSongsController.js';
import addAccompanimentToSongController from './controllers/addAccompanimentToSong.js';
import seedDatabaseController from './controllers/admin/seedDatabaseController.js';
import autocompleteController from './controllers/autocompleteController.js';
import getSongTitlesController from './controllers/admin/getSongTitlesController.js';
import pruneSongsController from './controllers/admin/pruneSongsController.js';

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();
const frontEndUrl = process.env.FRONT_END_URL;

const corsOptions = {
  origin: frontEndUrl,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { });
const { connection } = mongoose;
connection.once('open', () => {
  // eslint-disable-next-line no-console
  console.info('MongoDB database connection established');
});

// Set up controllers
// Accompaniment Controllers
addAccompanimentToSongController(app);

// Song Controllers
getSongAtIdController(app);
createSongController(app);
getAllSongsController(app);
autocompleteController(app);

// Admin Controllers
seedDatabaseController(app);
getSongTitlesController(app);
pruneSongsController(app);

http.createServer(app).listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server Started. Listening on *:${port}`);
});
