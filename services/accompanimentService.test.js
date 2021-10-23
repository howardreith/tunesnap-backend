import AccompanimentModel from '../models/accompanimentModel';
import SongModel from '../models/songModel';
import { createAccompaniment } from './accompanimentService';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';

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

  let savedSong;
  beforeEach(async () => {
    const songData = {
      title: 'Erlkonig',
      composer: 'Franz Schubert',
      accompaniments: [],
    };
    const validSong = new SongModel(songData);
    savedSong = await validSong.save();
  });

  describe('createAccompaniment', () => {
    it('successfully creates an accompaniment and adds it to a song', async () => {
      const accompanimentData = {
        songId: savedSong._id,
        url: 'https://www.youtube.com/aUrl',
      };
      const songWithCreatedAccompaniment = await createAccompaniment(accompanimentData);
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
  });
});
