import AccompanimentModel from './accompanimentModel';
import SongModel from './songModel';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';
import UserModel from './userModel';

describe('AccompanimentModel', () => {
  beforeAll(async () => {
    await connectToInMemoryDb();
  });

  afterAll(async () => {
    await disconnectFromInMemoryDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  let accompanimentData;
  let songId;
  let savedUser;
  beforeEach(async () => {
    const userData = {
      email: 'david@gnome.com',
      password: 'anEncryptedPassword',
      displayName: 'David the Gnome',
      dateJoined: new Date(),
    };
    const validUser = new UserModel(userData);
    savedUser = await validUser.save();
    const songData = {
      title: 'Erlkonig',
      composer: 'Franz Schubert',
    };
    const validSong = new SongModel(songData);
    const savedSong = await validSong.save();
    songId = savedSong._id;

    accompanimentData = {
      songId,
      url: 'https://www.youtube.com/random',
      addedBy: savedUser._id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };
  });

  it('creates and saves accompaniment successfully', async () => {
    const validAccompaniment = new AccompanimentModel(accompanimentData);
    const savedAccompaniment = await validAccompaniment.save();
    // Object id should be defined when successfully saved to MongoDB.
    expect(savedAccompaniment._id).toBeDefined();
    expect(savedAccompaniment.songId).toBe(songId);
    expect(savedAccompaniment.url).toBe(accompanimentData.url);
  });

  it('throws an error with insufficient data', async () => {
    accompanimentData.songId = undefined;
    const invalidAccompaniment = new AccompanimentModel(accompanimentData);
    await expect(invalidAccompaniment.save()).rejects.toThrowError('Accompaniment validation failed: songId: Path `songId` is required');
  });

  it('creates a product with stripe data', async () => {
    const stripeAccompanimentData = {
      ...accompanimentData,
      stripe: {
        id: 'prod_OE0n9IUOlkh0dh',
        created: new Date().getTime() / 1000,
        name: 'aNewProduct',
        updated: new Date().getTime() / 1000,
        stripeIdOfCreator: 'something',
      },
    };
    const stripeAccompaniment = new AccompanimentModel(stripeAccompanimentData);
    const saved = await stripeAccompaniment.save();
    const inDatabase = await AccompanimentModel.findById(saved._id.toString());
    expect(inDatabase.stripe._id).toBeTruthy();
    expect(inDatabase.stripe.id).toEqual(stripeAccompanimentData.stripe.id);
    expect(inDatabase.stripe.name).toEqual(stripeAccompanimentData.stripe.name);
    expect(inDatabase.stripe.stripeIdOfCreator).toEqual(stripeAccompanimentData.stripe.stripeIdOfCreator);
    expect(inDatabase.stripe.created).toEqual(stripeAccompanimentData.stripe.created);
    expect(inDatabase.stripe.updated).toEqual(stripeAccompanimentData.stripe.updated);
  });
});
