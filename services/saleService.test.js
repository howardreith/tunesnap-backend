import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers.js';
import UserModel from '../models/userModel.js';
import SongModel from '../models/songModel.js';
import * as s3Helpers from '../utils/s3Helpers.js';
import AccompanimentModel from '../models/accompanimentModel.js';
import { createSale } from './saleService.js';
import SalesModel from '../models/salesModel.js';

describe('saleService', () => {
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
  let secondSavedUser;
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
      artist: 'David the Gnome',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      price: 5,
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

    const userData2 = {
      email: 'lisa@gnome.com',
      password: 'anEncryptedPassword',
      displayName: 'Lisa the Gnome',
      dateJoined: new Date(),
      cart: [savedAccompaniment._id.toString()],
    };
    const validUser2 = new UserModel(userData2);
    secondSavedUser = await validUser2.save();
  });

  describe('createSale', () => {
    it('returns the accompaniments owned and the saved sale id', async () => {
      const saleData = {
        accompanimentsSold: [{
          id: savedAccompaniment._id.toString(),
          pricePaid: savedAccompaniment.price,
          currency: savedAccompaniment.currency,
          dateOfPurchase: new Date(),
        }],
        currency: 'USD',
        totalPrice: 5,
      };
      const purchaserId = secondSavedUser._id;
      const result = await createSale(saleData, purchaserId);
      const expectedAccompanimentsOwned = [{
        accompaniment: saleData.accompanimentsSold[0].id,
        pricePaid: saleData.accompanimentsSold[0].pricePaid,
        currency: saleData.accompanimentsSold[0].currency,
        dateOfPurchase: saleData.accompanimentsSold[0].dateOfPurchase,
      }];
      expect(result.accompanimentsOwned).toEqual(expectedAccompanimentsOwned);
      expect(result.saleId).toBeTruthy();
    });

    it('saves a sale to the database', async () => {
      const saleData = {
        accompanimentsSold: [{
          id: savedAccompaniment._id.toString(),
          pricePaid: savedAccompaniment.price,
          currency: savedAccompaniment.currency,
          dateOfPurchase: new Date(),
        }],
        currency: 'USD',
        totalPrice: 5,
      };
      const purchaserId = secondSavedUser._id;
      const result = await createSale(saleData, purchaserId);
      const inDbResult = await SalesModel.findById(result.saleId);
      expect(inDbResult).toBeTruthy();
      expect(inDbResult._id).toEqual(result.saleId);
      Object.keys(saleData)
        .filter((key) => !['accompanimentsSold', 'totalPrice'].includes(key))
        .forEach((dataKey) => {
          try {
            expect(inDbResult[dataKey]).toEqual(saleData[dataKey]);
          } catch (e) {
            throw Error(`Failed on ${dataKey}`);
          }
        });
      expect(String(inDbResult.totalPrice)).toEqual(String(saleData.totalPrice));
      expect(inDbResult.accompanimentsSold[0].accompaniment.toString())
        .toEqual(saleData.accompanimentsSold[0].id);
      expect(inDbResult.accompanimentsSold[0].accompaniment.toString())
        .toEqual(savedAccompaniment._id.toString());
    });

    it('updates the users owned accompaniments and cart', async () => {
      const saleData = {
        accompanimentsSold: [{
          id: savedAccompaniment._id.toString(),
          pricePaid: savedAccompaniment.price,
          currency: savedAccompaniment.currency,
          dateOfPurchase: new Date(),
        }],
        currency: 'USD',
        totalPrice: 5,
      };
      const purchaserId = secondSavedUser._id;
      expect(secondSavedUser.cart.length).toBeGreaterThan(0);
      expect(secondSavedUser.accompanimentsOwned.length).toEqual(0);
      await createSale(saleData, purchaserId);
      const updatedUser = await UserModel.findById(purchaserId);
      expect(updatedUser.cart.length).toEqual(0);
      expect(updatedUser.accompanimentsOwned.length).toBeGreaterThan(0);
      expect(updatedUser.accompanimentsOwned[0].accompaniment)
        .toEqual(savedAccompaniment._id);
    });
  });
});
