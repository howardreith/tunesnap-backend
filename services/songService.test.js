import mongoose from 'mongoose';
import { createSong, getSongAtId, getAllSongs } from './songService.js';
import SongModel from '../models/songModel';

describe('songService', () => {
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

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    await collections[0].deleteMany({});
  });

  describe('createSong', () => {
    it('successfully creates a song in the database', async () => {
      const song = { name: 'Erlkonig', composer: 'Franz Schubert' };
      const createdSong = await createSong(song);
      expect(createdSong).toBeTruthy();
      expect(createdSong._id).toBeTruthy();
      const retrieved = await SongModel.findById(createdSong._id);
      expect(retrieved.name).toEqual(song.name);
      expect(retrieved.composer).toEqual(song.composer);
    });
  });

  describe('getSongAtIde', () => {
    it('retrieves the song at the given _id', async () => {
      const songData = { name: 'Erlkonig', composer: 'Franz Schubert' };
      const validSong = new SongModel(songData);
      const savedSong = await validSong.save();
      const id = savedSong._id;
      const retrievedSong = await getSongAtId(id);
      expect(retrievedSong.name).toEqual(songData.name);
      expect(retrievedSong.composer).toEqual(songData.composer);
    });
  });

  describe('getAllSongs', () => {
    it('retrieves all the songs', async () => {
      const songData1 = { name: 'Erlkonig', composer: 'Franz Schubert' };
      const songData2 = { name: 'Der Lindenbaum', composer: 'Franz Schubert' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      await validSong1.save();
      await validSong2.save();
      const retrievedSongs = await getAllSongs(null);
      expect(retrievedSongs.length).toEqual(2);
      expect(retrievedSongs[0]).toMatchObject(songData1);
      expect(retrievedSongs[1]).toMatchObject(songData2);
    });
  });
});
