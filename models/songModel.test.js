import SongModel from './songModel';
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

  let songData;
  beforeEach(() => {
    songData = {
      title: 'Erlkonig',
      composer: 'Franz Schubert',
    };
  });

  it('creates and saves song successfully', async () => {
    const validSong = new SongModel(songData);
    const savedSong = await validSong.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedSong._id).toBeDefined();
    expect(savedSong.title).toBe(songData.title);
    expect(savedSong.composer).toBe(songData.composer);
  });

  it('throws an error with insufficient data', async () => {
    songData.title = undefined;
    const invalidSong = new SongModel(songData);
    await expect(invalidSong.save()).rejects.toThrowError('Song validation failed: title: Path `title` is required');
  });
});
