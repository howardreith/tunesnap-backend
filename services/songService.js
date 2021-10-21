import SongModel from '../models/songModel.js';

export async function createSong(song) {
  if (!Array.isArray(song.accompaniments)) {
    throw Error('Accompaniments must be an array');
  }
  const newSong = new SongModel(song);
  return newSong.save();
}

export async function getSongAtId(id) {
  return SongModel.findById(id);
}

export async function getAllSongs(filter = {}) {
  return SongModel.find(filter);
}

export async function addAccompanimentToSong(songId, accompanimentId) {
  const song = await getSongAtId(songId);
  if (!song.accompaniments) {
    song.accompaniments = [];
  }
  song.accompaniments.push(accompanimentId);
  return song.save();
}

export default {
  createSong,
  getAllSongs,
  getSongAtId,
};
