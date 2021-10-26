import mongoose from 'mongoose';
import { seedDb } from './adminService.js';
import { connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';
import SongModel from '../models/songModel';

describe('songService', () => {
  beforeAll(async () => {
    await connectToInMemoryDb();
  });

  afterAll(async () => {
    await disconnectFromInMemoryDb();
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    collections?.map((conn) => {
      conn.deleteMany({});
      return null;
    });
  });

  describe('seedDb', () => {
    it('successfully seeds the database from the json file', async () => {
      await seedDb();
      await setTimeout(() => {}, 500);
      await SongModel.find();
      const songs = await SongModel.find();
      expect(songs.length).toEqual(2);
      expect(songs[1]._id).toBeTruthy();
    });
  });
});
