import mongoose from 'mongoose';
import SongModel from './songModel';

describe('SongModel', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true }, (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(1);
      }
    });
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    collections.map((conn) => {
      conn.deleteMany({});
      return null;
    });
  });

  let songData;
  beforeEach(() => {
    songData = {
      name: 'Erlkonig',
      composer: 'Franz Schubert',
    };
  });

  it('creates and saves song successfully', async () => {
    const validSong = new SongModel(songData);
    const savedSong = await validSong.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedSong._id).toBeDefined();
    expect(savedSong.name).toBe(songData.name);
    expect(savedSong.composer).toBe(songData.composer);
  });

  it('throws an error with insufficient data', async () => {
    songData.name = undefined;
    const invalidSong = new SongModel(songData);
    await expect(invalidSong.save()).rejects.toThrowError('Song validation failed: name: Path `name` is required');
  });
});
