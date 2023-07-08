// eslint-disable-next-line jest/no-mocks-import
import { Stripe } from './__mocks__/stripe.js';
import AccompanimentModel from '../models/accompanimentModel';
import SongModel from '../models/songModel';
import UserModel from '../models/userModel';
import { createAccompaniment, getAccompanimentAtId, rateAccompaniment } from './accompanimentService';
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

  describe('createAccompaniment', () => {
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
      // eslint-disable-next-line no-import-assign
      s3Helpers.uploadFile = jest.fn().mockResolvedValue({ Location: 'https://fakeAmazonS3Url' });
    });

    it('successfully creates a linked accompaniment and adds it to a song', async () => {
      const accompanimentData = {
        songId: savedSong._id,
        url: 'https://www.youtube.com/aUrl',
      };
      const { song: songWithCreatedAccompaniment } = await createAccompaniment(
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
      const { song: songWithCreatedAccompaniment, user, newAccompanimentId } = await createAccompaniment(
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
      expect(user.accompanimentSubmissions[0].toString())
        .toEqual(createdAccompaniment._id.toString());
      expect(user.accompanimentsOwned[0].accompaniment.toString())
        .toEqual(createdAccompaniment._id.toString());
      expect(newAccompanimentId).toBeTruthy();
      expect(user.accompanimentsOwned[0].accompaniment.toString())
        .toEqual(newAccompanimentId);
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

    it('creates the new product in stripe when a price is present', async () => {
      Stripe.prototype.products.create = jest.fn().mockImplementation(({ name }) => ({
        id: 'prod_OE1mM6JkyLDtHZ',
        name,
        created: new Date().getTime() / 1000,
        updated: new Date().getTime() / 1000,
      }));
      const accompanimentData = {
        songId: savedSong._id,
        price: 6.50,
      };
      const fileData = {
        originalname: 'testFile.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };
      const createAccompanimentResult = await createAccompaniment(
        accompanimentData,
        savedUser._id.toString(),
        fileData,
      );
      expect(Stripe.prototype.products.create).toHaveBeenCalledWith({
        default_price_data: {
          currency: 'usd',
          unit_amount: 650,
        },
        name: createAccompanimentResult.newAccompanimentId,
      });
    });

    it('adds the stripe metadata to the database when purchaseable', async () => {
      const accompanimentData = {
        songId: savedSong._id,
        price: 6.50,
      };
      const fileData = {
        originalname: 'testFile.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };
      const createAccompanimentResult = await createAccompaniment(
        accompanimentData,
        savedUser._id.toString(),
        fileData,
      );

      const newAccomp = await AccompanimentModel.findById(createAccompanimentResult.newAccompanimentId);
      expect(newAccomp.stripe.id).toEqual('prod_OE1mM6JkyLDtHZ');
      expect(newAccomp.stripe.created).toBeTruthy();
      expect(newAccomp.stripe.name).toEqual(createAccompanimentResult.newAccompanimentId);
      expect(newAccomp.stripe.updated).toBeTruthy();
      expect(newAccomp.stripe._id).toBeTruthy();
    });
  });

  describe('getAccompanimentAtId', () => {
    let savedSong;
    let savedUser;
    let savedUser2;
    let savedUser3;
    let savedAccompaniment;
    beforeEach(async () => {
      const userData = {
        email: 'david@gnome.com',
        password: 'anEncryptedPassword',
        displayName: 'David The Gnome',
        dateJoined: new Date(),
      };
      const validUser = new UserModel(userData);
      savedUser = await validUser.save();
      const userData2 = {
        email: 'lisa@gnome.com',
        password: 'anEncryptedPassword',
        displayName: 'Lisa the Gnome',
        dateJoined: new Date(),
      };
      const validUser2 = new UserModel(userData2);
      savedUser2 = await validUser2.save();
      const userData3 = {
        email: 'swift@gnome.com',
        password: 'anEncryptedPassword',
        displayName: 'Swift the Fox',
        dateJoined: new Date(),
      };
      const validUser3 = new UserModel(userData3);
      savedUser3 = await validUser3.save();

      const songData = {
        title: 'Erlkonig',
        composer: 'Franz Schubert',
        accompaniments: [],
      };
      const validSong = new SongModel(songData);
      savedSong = await validSong.save();
      // eslint-disable-next-line no-import-assign
      s3Helpers.uploadFile = jest.fn().mockResolvedValue({ Location: 'https://fakeAmazonS3Url' });
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
      await AccompanimentModel.findByIdAndUpdate(
        savedAccompaniment._id,
        { url: `${process.env.FRONT_END_URL}/songs/accompaniments/${savedAccompaniment._id}` },
      );
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

    it('returns the average rating of all ratings in the accompaniment', async () => {
      const ratings = [
        { raterId: savedUser._id.toString(), rating: 5 },
        { raterId: savedUser2._id.toString(), rating: 3 },
        { raterId: savedUser3._id.toString(), rating: 2 },
      ];
      await AccompanimentModel.findByIdAndUpdate(
        savedAccompaniment._id,
        { ratings },
      );
      const accompaniment = await getAccompanimentAtId(savedAccompaniment._id);
      expect(accompaniment.averageRating).toEqual(3.3);
    });

    it('returns the user rating if present', async () => {
      const ratings = [
        { raterId: savedUser._id.toString(), rating: 5 },
        { raterId: savedUser2._id.toString(), rating: 3 },
        { raterId: savedUser3._id.toString(), rating: 2 },
      ];
      await AccompanimentModel.findByIdAndUpdate(
        savedAccompaniment._id,
        { ratings },
      );
      const accompaniment = await getAccompanimentAtId(savedAccompaniment._id, savedUser._id.toString());
      expect(accompaniment.userRating).toEqual(ratings[0].rating);
    });

    it('returns a null user rating if not present', async () => {
      const ratings = [
        { raterId: savedUser._id.toString(), rating: 5 },
        { raterId: savedUser2._id.toString(), rating: 3 },
      ];
      await AccompanimentModel.findByIdAndUpdate(
        savedAccompaniment._id,
        { ratings },
      );
      const accompaniment = await getAccompanimentAtId(savedAccompaniment._id, savedUser3._id.toString());
      expect(accompaniment.userRating).toEqual(null);
    });
  });

  describe('rateAccompaniment', () => {
    let savedSong;
    let savedUser;
    let savedUser2;
    let savedAccompaniment;
    beforeEach(async () => {
      const userData = {
        email: 'david@gnome.com',
        password: 'anEncryptedPassword',
        displayName: 'David The Gnome',
        dateJoined: new Date(),
      };
      const validUser = new UserModel(userData);
      savedUser = await validUser.save();
      const userData2 = {
        email: 'lisa@gnome.com',
        password: 'anEncryptedPassword',
        displayName: 'Lisa The Gnome',
        dateJoined: new Date(),
      };
      const validUser2 = new UserModel(userData2);
      savedUser2 = await validUser2.save();
      const songData = {
        title: 'Erlkonig',
        composer: 'Franz Schubert',
        accompaniments: [],
      };
      const validSong = new SongModel(songData);
      savedSong = await validSong.save();
      // eslint-disable-next-line no-import-assign
      s3Helpers.uploadFile = jest.fn().mockResolvedValue({ Location: 'https://fakeAmazonS3Url' });

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
      await AccompanimentModel.findByIdAndUpdate(
        savedAccompaniment._id,
        { url: `${process.env.FRONT_END_URL}/songs/accompaniments/${savedAccompaniment._id}` },
      );
      savedAccompaniment = await AccompanimentModel.findById(savedAccompaniment._id);
    });

    it('pushes the rating into the ratings list', async () => {
      const rating = 5;
      await rateAccompaniment(savedUser._id.toString(), savedAccompaniment._id.toString(), rating);
      const updatedInDb = await AccompanimentModel.findById(savedAccompaniment._id.toString());
      expect(updatedInDb.ratings[0].raterId.toString()).toEqual(savedUser._id.toString());
      expect(updatedInDb.ratings[0].rating).toEqual(rating);
    });

    it('updates a rating if already in the list', async () => {
      const rating = 3;
      await rateAccompaniment(savedUser._id.toString(), savedAccompaniment._id.toString(), 5);
      await rateAccompaniment(savedUser._id.toString(), savedAccompaniment._id.toString(), rating);
      const updatedInDb = await AccompanimentModel.findById(savedAccompaniment._id.toString());
      expect(updatedInDb.ratings[0].raterId.toString()).toEqual(savedUser._id.toString());
      expect(updatedInDb.ratings[0].rating).toEqual(rating);
    });

    it('returns the userRating and averageRating', async () => {
      await rateAccompaniment(savedUser._id.toString(), savedAccompaniment._id.toString(), 5);
      const result = await rateAccompaniment(savedUser2._id.toString(), savedAccompaniment._id.toString(), 3);
      const expected = { userRating: 3, averageRating: 4 };
      expect(result).toEqual(expected);
    });
  });
});
