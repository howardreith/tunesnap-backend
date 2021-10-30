import { SORT_OPTIONS, getAndSortSongsAccordingToParam } from './songHelpers';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from './testHelpers';
import SongModel from '../models/songModel';

describe('songHelpers', () => {
  describe('sortSongsAccordingToParam', () => {
    beforeAll(async () => {
      await connectToInMemoryDb();
    });

    afterAll(async () => {
      await disconnectFromInMemoryDb();
    });

    afterEach(async () => {
      await clearDatabase();
    });
    let songs;
    let song1;
    let song2;
    let song3;
    beforeEach(async () => {
      song1 = {
        // _id: '6177303e031363d938d3b26b',
        title: 'Aardvark',
        composer: 'Mark Markety',
        lyricist: 'David Davidy',
        opusNumber: 'op. 550',
        songCycle: 'Yuppy Songs',
        songCycleIndex: '1',
        textAndTranslation: 'https://website.com',
        accompaniments: [],
      };
      song2 = {
        // _id: '6177303e031363d938d3b26c',
        title: 'Tiger',
        composer: 'Tim Timothy',
        lyricist: 'Bob the Builder',
        opusNumber: 'op. 22',
        songCycle: 'Candy Canes',
        songCycleIndex: '2',
        textAndTranslation: 'https://website.com',
        accompaniments: [],
      };
      song3 = {
        // _id: '6177303e031363d938d3b26d',
        title: 'Elephant',
        composer: 'Normal Person',
        lyricist: 'Abnormal Person',
        opusNumber: 'op. 6',
        textAndTranslation: 'https://website.com',
        accompaniments: [],
      };
      const song1toSave = new SongModel(song1);
      const song2toSave = new SongModel(song2);
      const song3toSave = new SongModel(song3);
      await song1toSave.save();
      await song2toSave.save();
      await song3toSave.save();
    });

    it('should sort by title', async () => {
      const result = await getAndSortSongsAccordingToParam(SORT_OPTIONS.TITLE);
      expect(result)
        .toEqual([
          expect.objectContaining(song1),
          expect.objectContaining(song3),
          expect.objectContaining(song2),
        ]);
    });

    it('should sort by title by default', async () => {
      const result = await getAndSortSongsAccordingToParam(songs, undefined);
      expect(result)
        .toEqual([
          expect.objectContaining(song1),
          expect.objectContaining(song3),
          expect.objectContaining(song2),
        ]);
    });

    it('should sort by reverse title', async () => {
      const result = await getAndSortSongsAccordingToParam(SORT_OPTIONS.TITLE_REVERSE);
      expect(result)
        .toEqual([
          expect.objectContaining(song2),
          expect.objectContaining(song3),
          expect.objectContaining(song1),
        ]);
    });

    it('should sort by song cycle', async () => {
      const result = await getAndSortSongsAccordingToParam(SORT_OPTIONS.SONG_CYCLE);
      expect(result)
        .toEqual([
          expect.objectContaining(song3),
          expect.objectContaining(song2),
          expect.objectContaining(song1),
        ]);
    });

    it('should sort by song cycle reverse', async () => {
      const result = await getAndSortSongsAccordingToParam(SORT_OPTIONS.SONG_CYCLE_REVERSE);
      expect(result)
        .toEqual([
          expect.objectContaining(song1),
          expect.objectContaining(song2),
          expect.objectContaining(song3),
        ]);
    });

    it('should sort by composer last name', async () => {
      const result = await getAndSortSongsAccordingToParam(SORT_OPTIONS.COMPOSER);
      expect(result)
        .toEqual([
          expect.objectContaining(song1),
          expect.objectContaining(song3),
          expect.objectContaining(song2),
        ]);
    });

    it('should sort by composer last name reverse', async () => {
      const result = await getAndSortSongsAccordingToParam(SORT_OPTIONS.COMPOSER_REVERSE);
      expect(result)
        .toEqual([
          expect.objectContaining(song2),
          expect.objectContaining(song3),
          expect.objectContaining(song1),
        ]);
    });
  });
});
