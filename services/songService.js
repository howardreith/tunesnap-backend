import SongModel from '../models/songModel.js';

export async function createSong(song) {
  const newSong = new SongModel(song);
  return newSong.save();
}

export async function getSongAtId(id) {
  return SongModel.findById(id);
}

export async function getAllSongs(filter = {}) {
  return SongModel.find(filter);
}

export default {
  createSong,
  getAllSongs,
  getSongAtId,
};
