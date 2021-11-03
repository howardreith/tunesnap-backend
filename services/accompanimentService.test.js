import AccompanimentModel from '../models/accompanimentModel';
import SongModel from '../models/songModel';
import UserModel from '../models/userModel';
import { createAccompaniment } from './accompanimentService';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';
import * as s3Helpers from '../utils/s3Helpers';

describe('accompanimentService', () => {
  beforeAll(async () => {
    await connectToInMemoryDb();
  });

  afterAll(async () => {
    await disconnectFromInMemoryDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  let savedSong;
  let savedUser;
  beforeEach(async () => {
    const userData = {
      email: 'david@gnome.com',
      password: 'anEncryptedPassword',
      dateJoined: new Date(),
    };
    const validUser = new UserModel(userData);
    savedUser = await validUser.save();
    const songData = {
      title: 'Erlkonig',
      composer: 'Franz Schubert',
      accompaniments: [],
    };
    const validSong = new SongModel(songData);
    savedSong = await validSong.save();
    s3Helpers.uploadFile = jest.fn().mockResolvedValue({ Location: 'https://fakeAmazonS3Url' });
  });

  describe('createAccompaniment', () => {
    it('successfully creates a linked accompaniment and adds it to a song', async () => {
      const accompanimentData = {
        songId: savedSong._id,
        url: 'https://www.youtube.com/aUrl',
      };
      const songWithCreatedAccompaniment = await createAccompaniment(
        accompanimentData,
        savedUser._id.toString(),
      );
      expect(songWithCreatedAccompaniment).toBeTruthy();
      expect(songWithCreatedAccompaniment._id).toEqual(savedSong._id);
      const createdAccompaniment = songWithCreatedAccompaniment.accompaniments[0];
      expect(createdAccompaniment._id).toBeTruthy();
      const retrievedAccompaniment = await AccompanimentModel
        .findById(createdAccompaniment._id);
      expect(retrievedAccompaniment.songId).toEqual(savedSong._id);
      expect(retrievedAccompaniment.url).toEqual(accompanimentData.url);
      const updatedSong = await SongModel.findById(savedSong._id);
      expect(updatedSong.accompaniments[0])
        .toEqual(songWithCreatedAccompaniment.accompaniments[0]._id);
      expect(createdAccompaniment.url).toEqual(retrievedAccompaniment.url);
      expect(createdAccompaniment.songId).toEqual(retrievedAccompaniment.songId);
    });

    it('successfully creates an uploaded accompaniment and adds it to a song', async () => {
      const accompanimentData = {
        songId: savedSong._id,
      };
      const fileData = {
        originalname: 'testFile.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };
      const songWithCreatedAccompaniment = await createAccompaniment(
        accompanimentData,
        savedUser._id.toString(),
        fileData,
      );
      expect(songWithCreatedAccompaniment).toBeTruthy();
      expect(songWithCreatedAccompaniment._id).toEqual(savedSong._id);
      const createdAccompaniment = songWithCreatedAccompaniment.accompaniments[0];
      expect(createdAccompaniment._id).toBeTruthy();
      const retrievedAccompaniment = await AccompanimentModel
        .findById(createdAccompaniment._id);
      expect(retrievedAccompaniment.songId).toEqual(savedSong._id);
      expect(retrievedAccompaniment.url).toEqual(`${process.env.FRONT_END_URL}/songs/accompaniments/${createdAccompaniment._id}`);
      expect(retrievedAccompaniment.file).toEqual(expect.objectContaining({
        mimetype: 'mp3', originalFilename: 'testFile.mp3', size: '1mb', url: 'https://fakeAmazonS3Url', _id: expect.anything(),
      }));
      const updatedSong = await SongModel.findById(savedSong._id);
      expect(updatedSong.accompaniments[0])
        .toEqual(songWithCreatedAccompaniment.accompaniments[0]._id);
      expect(createdAccompaniment.url).toEqual(retrievedAccompaniment.url);
      expect(createdAccompaniment.songId).toEqual(retrievedAccompaniment.songId);
      expect(createdAccompaniment.file._id).toEqual(retrievedAccompaniment.file._id);
    });
  });
});
