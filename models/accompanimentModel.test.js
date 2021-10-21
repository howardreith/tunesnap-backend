import mongoose from 'mongoose';
import AccompanimentModel from './accompanimentModel';
import SongModel from './songModel';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';

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
  beforeEach(async () => {
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
    };
  });

  it('creates and saves accompaniment successfully', async () => {
    const validAccompaniment = new AccompanimentModel(accompanimentData);
    const savedAccompaniment = await validAccompaniment.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedAccompaniment._id).toBeDefined();
    expect(savedAccompaniment.songId).toBe(songId);
    expect(savedAccompaniment.url).toBe(accompanimentData.url);
  });

  it('throws an error with insufficient data', async () => {
    accompanimentData.url = undefined;
    const invalidAccompaniment = new AccompanimentModel(accompanimentData);
    await expect(invalidAccompaniment.save()).rejects.toThrowError('Accompaniment validation failed: url: Path `url` is required');
  });
});
