import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import AccompanimentModel from '../models/accompanimentModel.js';
import SongModel from '../models/songModel.js';
import { uploadFile, getFileAndAddItToResponse } from '../utils/s3Helpers.js';
import UserModel from '../models/userModel.js';
import { decodeToken } from '../utils/authHelpers.js';

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

  let user = await UserModel.findById(creatorId);
  const userAccompanimentSubmissions = [...user.accompanimentSubmissions, savedAccompaniment._id];
  await UserModel.findByIdAndUpdate(
    creatorId,
    { accompanimentSubmissions: userAccompanimentSubmissions },
  );
  if (fileToUpload) {
    const dataToAddToOwnedAccompaniments = {
      accompaniment: savedAccompaniment._id,
      pricePaid: 0,
      currency: 'USD',
      dateOfPurchase: new Date(),
    };
    const userOwnedAccompaniments = [...user.accompanimentsOwned, dataToAddToOwnedAccompaniments];
    await UserModel.findByIdAndUpdate(
      creatorId,
      { accompanimentsOwned: userOwnedAccompaniments },
    );
    user = await UserModel.findById(creatorId);
  }

  song = await SongModel.findById(accompanimentData.songId).populate('accompaniments');
  return { user, song };
}

export async function getAccompanimentAtId(id) {
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

export async function getAccompanimentFileAtId(accompanimentId, token, res) {
  const { id: userId } = decodeToken(token);

  const { file } = await AccompanimentModel.findById(accompanimentId);
  const { originalFileName, s3Key } = file;
  let tokenIsValid;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    tokenIsValid = true;
  } catch (e) {
    tokenIsValid = false;
  }

  let userOwnsThis = false;
  if (userId) {
    const user = await UserModel.findById(userId).populate('accompanimentsOwned');
    const { accompanimentsOwned } = await user.populate('accompanimentsOwned');
    const accompanimentIds = accompanimentsOwned.map((acc) => acc.accompaniment.toString());
    userOwnsThis = accompanimentIds.includes(accompanimentId.toString());
  }

  if (!token || !userId || !tokenIsValid || !userOwnsThis) {
    getFileAndAddItToResponse(originalFileName, `${s3Key}-sample`, res);
  } else {
    getFileAndAddItToResponse(originalFileName, s3Key, res);
  }
}
