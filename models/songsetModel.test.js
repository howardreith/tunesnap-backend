import SongsetModel from './songsetModel';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';
import SongModel from './songModel';

describe('SongsetModel', () => {
  beforeAll(async () => {
    await connectToInMemoryDb();
  });

  afterAll(async () => {
    await disconnectFromInMemoryDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  let songsetData;
  beforeEach(() => {
    songsetData = {
      setTitle: 'Earth and Air and Rain',
      songs: [],
    };
  });

  it('creates and saves song set successfully', async () => {
    const validSongSet = new SongsetModel(songsetData);
    const savedSongSet = await validSongSet.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedSongSet._id).toBeDefined();
    expect(savedSongSet.setTitle).toEqual(songsetData.setTitle);
    expect(savedSongSet.songs).toEqual(songsetData.songs);
  });

  it('successfully creates and saves song set successfully with songs in it', async () => {
    const song1Data = {
      title: 'The Clock of the Years',
      composer: 'Gerald Finzi',
    };
    const song2Data = {
      title: 'To Lizbie Browne',
      composer: 'Gerald Finzi',
    };
    const validSong1 = new SongModel(song1Data);
    const savedSong1 = await validSong1.save();
    const validSong2 = new SongModel(song2Data);
    const savedSong2 = await validSong2.save();
    songsetData.songs.push(savedSong1._id);
    songsetData.songs.push(savedSong2._id);

    const validSongSet = new SongsetModel(songsetData);
    const savedSongSet = await validSongSet.save();
    expect(savedSongSet._id).toBeDefined();
    expect(savedSongSet.songs).toEqual(songsetData.songs);
  });

  it('throws an error with insufficient data', async () => {
    songsetData.setTitle = undefined;
    const invalidSongSet = new SongsetModel(songsetData);
    await expect(invalidSongSet.save()).rejects.toThrowError('Songset validation failed: setTitle: Path `setTitle` is required');
  });
});
