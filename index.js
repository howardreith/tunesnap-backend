import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import implementControllers from './utils/implementControllers.js';

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();
const frontEndUrl = process.env.FRONT_END_URL;

const corsOptions = {
  // origin: frontEndUrl,
  origin: '*',
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
implementControllers(app);

http.createServer(app).listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server Started. Listening on *:${port}`);
});
