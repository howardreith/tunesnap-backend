import AccompanimentModel from '../models/accompanimentModel';
import SongModel from '../models/songModel';
import UserModel from '../models/userModel';
import { createAccompaniment, getAccompanimentAtId } from './accompanimentService';
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
      displayName: 'David The Gnome',
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

    it('adds linked accompaniment to the creators list of submissions', async () => {
      const accompanimentData = {
        songId: savedSong._id,
        url: 'https://www.youtube.com/aUrl',
      };
      await createAccompaniment(
        accompanimentData,
        savedUser._id.toString(),
      );
      const updatedUser = await UserModel.findById(savedUser._id);
      expect(updatedUser.accompanimentSubmissions.length).toEqual(1);
      const fullyPopulated = await updatedUser.populate('accompanimentSubmissions');
      expect(fullyPopulated.accompanimentSubmissions[0].url).toEqual(accompanimentData.url);
      expect(fullyPopulated.accompanimentSubmissions[0].addedBy.toString())
        .toEqual(savedUser._id.toString());
    });

    it('adds uploaded accompaniment to the creators list of submissions and owned songs', async () => {
      const accompanimentData = {
        songId: savedSong._id,
      };
      const fileData = {
        originalname: 'testFile.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };
      await createAccompaniment(
        accompanimentData,
        savedUser._id.toString(),
        fileData,
      );

      const updatedUser = await UserModel.findById(savedUser._id);
      expect(updatedUser.accompanimentSubmissions.length).toEqual(1);
      expect(updatedUser.accompanimentsOwned.length).toEqual(1);
      const fullyPopulatedSubmissions = await updatedUser.populate('accompanimentSubmissions');
      expect(fullyPopulatedSubmissions.accompanimentSubmissions[0].file.originalFilename)
        .toEqual(fileData.originalname);
      expect(fullyPopulatedSubmissions.accompanimentSubmissions[0].addedBy.toString())
        .toEqual(savedUser._id.toString());
      const fullyPopulatedOwned = await updatedUser.populate('accompanimentsOwned');
      const relevantAccompaniment = await AccompanimentModel
        .findById(fullyPopulatedOwned.accompanimentsOwned[0].accompaniment._id);
      expect(relevantAccompaniment.file.originalFilename)
        .toEqual(fileData.originalname);
      expect(relevantAccompaniment.addedBy.toString())
        .toEqual(savedUser._id.toString());
    });

    it('throws if there is not either a url or a file', async () => {
      const accompanimentData = {
        songId: savedSong._id,
        url: undefined,
      };
      await expect(createAccompaniment(accompanimentData, savedUser._id.toString(), undefined))
        .rejects.toThrowError('Must have either a URL or a file to upload');
    });
  });

  describe('getAccompanimentAtId', () => {
    let savedAccompaniment;
    beforeEach(async () => {
      const accompanimentData = {
        songId: savedSong._id,
        url: 'TBD',
        artist: 'David the Gnome',
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 0,
        currency: 'USD',
        key: 'D Minor',
        file: {
          originalFileName: 'ErlkonigAccompaniment.mp3',
          mimetype: 'mp3',
          size: '1000',
          url: 'https://amazonAwsLink',
          s3Key: 'e55543c697a1a74f31938af03359163c',
        },
        ratings: [],
        addedBy: savedUser._id,
      };
      const validAccompaniment = new AccompanimentModel(accompanimentData);
      savedAccompaniment = await validAccompaniment.save();
      await AccompanimentModel.findByIdAndUpdate(savedAccompaniment._id,
        { url: `${process.env.FRONT_END_URL}/songs/accompaniments/${savedAccompaniment._id}` });
      savedAccompaniment = await AccompanimentModel.findById(savedAccompaniment._id);
    });

    it('returns the accompaniment', async () => {
      const accompaniment = await getAccompanimentAtId(savedAccompaniment._id);
      expect(accompaniment._id).toEqual(savedAccompaniment._id);
      expect(accompaniment.song._id).toEqual(savedAccompaniment.songId);
      expect(accompaniment.file._id).toEqual(savedAccompaniment.file._id);
      expect(accompaniment.addedBy._id).toEqual(savedAccompaniment.addedBy);
      expect(accompaniment.file).toBeTruthy();
    });
  });
});
