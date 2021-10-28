import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { createSong } from './songService.js';
import SongModel from '../models/songModel.js';

const require = createRequire(import.meta.url);
const mockData = require('../mockData.json');
const realData = require('../seedJsonData');

export async function seedDb() {
  await Promise.all(realData.map(async (datum) => {
    datum.songs.map(async (song) => {
      await createSong(song);
    });
  }));
}

export async function getSongTitles() {
  SongModel.find().distinct('title', (error, results) => {
    writeFileSync('songTitlesFromDb.json', JSON.stringify(results));
  });
}

export default {
  seedDb,
  getSongTitles,
};
