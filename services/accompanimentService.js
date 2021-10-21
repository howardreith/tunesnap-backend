import AccompanimentModel from '../models/accompanimentModel';
import SongModel from '../models/songModel';

export async function createAccompaniment(accompanimentData) {
  const newAccompaniment = new AccompanimentModel(accompanimentData);
  const savedAccompaniment = await newAccompaniment.save();
  const song = await SongModel.findById(accompanimentData.songId);
  const accompaniments = [...song.accompaniments, savedAccompaniment];
  await SongModel.updateOne({ _id: accompanimentData.songId }, { accompaniments });
  return savedAccompaniment;
}
