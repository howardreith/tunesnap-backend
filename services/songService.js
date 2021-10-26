import SongModel from '../models/songModel.js';

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

export default {
  createSong,
  getAllSongs,
  getSongAtId,
};
