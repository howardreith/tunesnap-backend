import UserModel from './userModel.js';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';

describe('SongModel', () => {
  beforeAll(async () => {
    await connectToInMemoryDb();
  });

  afterAll(async () => {
    await disconnectFromInMemoryDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  let userData;
  beforeEach(() => {
    userData = {
      email: 'David@gnome.com',
      password: 'f2980j9ej985j89345j',
      dateJoined: new Date(),
    };
  });

  it('creates and saves user successfully', async () => {
    const validUser = new UserModel(userData);
    const savedUser = await validUser.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.title);
  });

  it('finds a user by id using ordinary find', async () => {
    const validUser = new UserModel(userData);
    const savedUser = await validUser.save();
    const foundSong = (await UserModel.find({ id: savedUser._id }))[0];
    expect(foundSong.name).toEqual(validUser.name);
    expect(foundSong._id).toEqual(savedUser._id);
  });
});
