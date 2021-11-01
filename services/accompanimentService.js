import mongoose from 'mongoose';
import AccompanimentModel from '../models/accompanimentModel.js';
import SongModel from '../models/songModel.js';

export async function createAccompaniment(accompanimentData, creatorId) {
  const addedBy = new mongoose.Types.ObjectId(creatorId);
  const parsedData = {
    songId: accompanimentData.songId,
    url: accompanimentData.url,
    addedBy,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    artist: accompanimentData.artist,
    price: accompanimentData.price,
    key: accompanimentData.key,
  };
  const newAccompaniment = new AccompanimentModel(parsedData);
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
