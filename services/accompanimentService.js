import mongoose from 'mongoose';
import AccompanimentModel from '../models/accompanimentModel.js';
import SongModel from '../models/songModel.js';
import { uploadFile } from '../utils/s3Helpers.js';

export async function createAccompaniment(accompanimentData, creatorId, fileToUpload) {
  const addedBy = new mongoose.Types.ObjectId(creatorId);
  let parsedData = {
    songId: accompanimentData.songId,
    url: accompanimentData.url,
    addedBy,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    artist: accompanimentData.artist,
    price: accompanimentData.price,
    key: accompanimentData.key,
  };
  if (fileToUpload) {
    const uploadResult = await uploadFile(fileToUpload);
    parsedData = {
      ...parsedData,
      url: 'TBD',
      file: {
        originalFilename: fileToUpload.originalname,
        mimetype: fileToUpload.mimetype,
        size: fileToUpload.size,
        url: uploadResult.Location,
        s3Key: uploadResult.key,
      },
    };
  }
  const newAccompaniment = new AccompanimentModel(parsedData);
  let savedAccompaniment;
  try {
    savedAccompaniment = await newAccompaniment.save();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error saving accompaniment: ', e);
  }
  if (fileToUpload) {
    await AccompanimentModel.findByIdAndUpdate(savedAccompaniment._id, { url: `${process.env.FRONT_END_URL}/songs/accompaniments/${savedAccompaniment._id}` });
  }
  let song = await SongModel.findById(accompanimentData.songId);
  const accompaniments = [...song.accompaniments, savedAccompaniment];
  await SongModel.updateOne({ _id: accompanimentData.songId }, { accompaniments });
  song = await SongModel.findById(accompanimentData.songId);
  return song.populate('accompaniments');
}
