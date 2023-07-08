import SalesModel from './salesModel.js';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';
import UserModel from './userModel.js';
import SongModel from './songModel.js';
import AccompanimentModel from './accompanimentModel.js';

describe('SalesModel', () => {
  beforeAll(async () => {
    await connectToInMemoryDb();
  });

  afterAll(async () => {
    await disconnectFromInMemoryDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  let songId;
  let buyerUser;
  let sellerUser;
  let savedAccompaniment;
  let salesData;
  beforeEach(async () => {
    const userData = {
      email: 'david@gnome.com',
      password: 'anEncryptedPassword',
      displayName: 'David the Gnome',
      dateJoined: new Date(),
    };
    const validUser = new UserModel(userData);
    buyerUser = await validUser.save();

    const userData2 = {
      email: 'lisa@gnome.com',
      password: 'anEncryptedPassword',
      displayName: 'Lisa the Gnome',
      dateJoined: new Date(),
    };
    const validUser2 = new UserModel(userData2);
    sellerUser = await validUser2.save();

    const songData = {
      title: 'Erlkonig',
      composer: 'Franz Schubert',
    };
    const validSong = new SongModel(songData);
    const savedSong = await validSong.save();
    songId = savedSong._id;

    const accompanimentData = {
      songId,
      url: 'https://www.youtube.com/random',
      addedBy: sellerUser._id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      price: 1,
      currency: 'USD',
    };

    const validAccompaniment = new AccompanimentModel(accompanimentData);
    savedAccompaniment = await validAccompaniment.save();

    salesData = {
      purchaserId: buyerUser._id,
      accompanimentsSold: [{
        accompaniment: savedAccompaniment._id,
        pricePaid: 1,
        currency: 'USD',
        dateOfPurchase: new Date(),
      }],
      dateCreated: new Date(),
      currency: 'USD',
      totalPrice: 1,
    };
  });

  it('creates and saves sale successfully', async () => {
    const validSale = new SalesModel(salesData);
    const savedSale = await validSale.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedSale._id).toBeDefined();
  });

  it('throws an error with insufficient data', async () => {
    salesData.purchaserId = undefined;
    const invalidSale = new SalesModel(salesData);
    await expect(invalidSale.save()).rejects.toThrowError('Sale validation failed: purchaserId: Path `purchaserId` is required.');
  });
});
