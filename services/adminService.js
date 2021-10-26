import { createRequire } from 'module';
import { createSong } from './songService.js';

const require = createRequire(import.meta.url);
const mockData = require('../mockData.json');
const realData = require('../seedJsonData');

export async function seedDb() {
  await Promise.all(realData.map(async (datum) => {
    datum.songs.map(async (song) => {
      console.log('===> song', song)
      await createSong(song);
    });
  }));
}

export default {
  seedDb,
};
