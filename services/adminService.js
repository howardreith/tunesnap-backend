import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { createSong } from './songService.js';
import SongModel from '../models/songModel.js';

const require = createRequire(import.meta.url);
const mockData = require('../mockData.json');
const realData = require('../seedJsonData');
const songTitlesJson = require('../songTitlesFromDb');

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

export async function pruneSongs() {
  // Starting at 54,327
  // Now start 80,951
  let count = 0;
  try {
    const songsObject = {};
    await Promise.all(
      songTitlesJson.map(async (title) => {
        const songsWithTitle = await SongModel.find({ title });
        songsWithTitle.forEach((song) => {
          if (!songsObject[song.composer]) {
            songsObject[song.composer] = song._id;
          }
          if (song.songCycle) {
            songsObject[song.composer] = song._id;
          }
        });

        await Promise.all(
          songsWithTitle.map(async (song) => {
            if (song._id !== songsObject[song.composer]) {
              try {
                count += 1;
                await SongModel.findByIdAndRemove(song._id.toString());
              } catch (e) {
                console.error('Error removing song ', song._id, e);
              }
            }
          }),
        );
      }),
    );
    console.info('I have deleted ', count, 'entries.');
  } catch (e) {
    console.error('Error pruning songs', e);
  }
  return 'success';
}

export default {
  seedDb,
  getSongTitles,
};
