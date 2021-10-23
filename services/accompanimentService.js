import AccompanimentModel from '../models/accompanimentModel.js';
import SongModel from '../models/songModel.js';

export async function createAccompaniment(accompanimentData) {
  const newAccompaniment = new AccompanimentModel(accompanimentData);
  let savedAccompaniment;
  try {
    savedAccompaniment = await newAccompaniment.save();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error saving accompaniment: ', e);
  }
  let song = await SongModel.findById(accompanimentData.songId);
  const accompaniments = [...song.accompaniments, savedAccompaniment];
  await SongModel.updateOne({ _id: accompanimentData.songId }, { accompaniments });
  song = await SongModel.findById(accompanimentData.songId);
  return song.populate('accompaniments');
}
