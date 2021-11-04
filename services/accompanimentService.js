import mongoose from 'mongoose';
import AccompanimentModel from '../models/accompanimentModel.js';
import SongModel from '../models/songModel.js';
import { uploadFile, getFileAndAddItToResponse } from '../utils/s3Helpers.js';
import UserModel from '../models/userModel.js';

export async function createAccompaniment(accompanimentData, creatorId, fileToUpload) {
  if (!accompanimentData.url && !fileToUpload) {
    throw Error('Must have either a URL or a file to upload');
  }
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
  let song = await SongModel.findById(accompanimentData.songId);
  const accompaniments = [...song.accompaniments, savedAccompaniment._id];
  await SongModel.findByIdAndUpdate(accompanimentData.songId, { accompaniments });

  const user = await UserModel.findById(creatorId);
  const userAccompanimentSubmissions = [...user.accompanimentSubmissions, savedAccompaniment._id];
  await UserModel.findByIdAndUpdate(creatorId,
    { accompanimentSubmissions: userAccompanimentSubmissions });
  if (fileToUpload) {
    const userOwnedAccompaniments = [...user.accompanimentsOwned, savedAccompaniment._id];
    await UserModel.findByIdAndUpdate(creatorId,
      { accompanimentsOwned: userOwnedAccompaniments });
  }

  song = await SongModel.findById(accompanimentData.songId);
  return song.populate('accompaniments');
}

export async function getAccompanimentAtId(id, userId) {
  // TODO if the user does not own the accompaniment they should not be able to see it
  const accompaniment = await (await (await AccompanimentModel.findById(id)).populate('songId')).populate('addedBy');
  return {
    _id: accompaniment._id,
    song: {
      _id: accompaniment.songId._id,
      title: accompaniment.songId.title,
      composer: accompaniment.songId.composer,
      lyricist: accompaniment.songId.lyricist,
      songCycle: accompaniment.songId.songCycle,
      songCycleIndex: accompaniment.songId.songCycleIndex,
      opusNumber: accompaniment.songId.opusNumber,
      textAndTranslation: accompaniment.songId.textAndTranslation,
    },
    artist: accompaniment.artist,
    dateCreated: accompaniment.dateCreated,
    dateUpdated: accompaniment.dateUpdated,
    price: accompaniment.price,
    key: accompaniment.key,
    file: {
      _id: accompaniment.file._id,
      size: accompaniment.file.size,
      mimetype: accompaniment.file.mimetype,
    },
    ratings: accompaniment.ratings,
    addedBy: {
      _id: accompaniment.addedBy._id,
      email: accompaniment.addedBy.email,
      displayName: accompaniment.addedBy.displayName,
    },
  };
}

export async function getAccompanimentFileAtId(id, userId, res) {
  // TODO if the user does not own the accompaniment they should not be able to see it
  const accompaniment = await AccompanimentModel.findById(id);
  getFileAndAddItToResponse(accompaniment.file, res);
}
