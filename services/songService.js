import schedule from 'node-schedule';
import SongModel from '../models/songModel.js';

let songs = [];
schedule.scheduleJob('0 0 * * *', async () => {
  songs = (await SongModel.find({}));
  // eslint-disable-next-line no-console
  console.info('Songs cache has been updated');
});

export async function createSong(song) {
  const songData = { ...song };
  if (!Array.isArray(songData.accompaniments)) {
    songData.accompaniments = [];
  }
  const newSong = new SongModel(song);
  return newSong.save();
}

export async function getSongAtId(id) {
  const song = await SongModel.findById(id);
  return song.populate('accompaniments');
}

export async function getAllSongs(filter = {}, limit = 10) {
  return SongModel.find(filter).limit(limit);
}

export async function getSongViaAutocomplete(searchString) {
  if (!songs || songs.length === 0) {
    songs = await SongModel.find({});
    // eslint-disable-next-line no-console
    console.info('Titles array has been updated in getSongViaAutocomplete');
  }
  const songIndexes = [];
  for (let i = 0; i < songs.length; i += 1) {
    if (songs[i].title.toLowerCase().includes(searchString.toLowerCase())
      || songs[i].title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .includes(searchString.toLowerCase())) {
      songIndexes.push(i);
    }
  }
  const matchesArray = [];
  for (let i = 0; i < songIndexes.length; i += 1) {
    matchesArray.push(songs[songIndexes[i]]);
  }
  return matchesArray;
}

export default {
  createSong,
  getAllSongs,
  getSongAtId,
  getSongViaAutocomplete,
};
