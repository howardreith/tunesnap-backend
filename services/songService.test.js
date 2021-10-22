import mongoose from 'mongoose';
import { createSong, getSongAtId, getAllSongs } from './songService.js';
import SongModel from '../models/songModel';
import { connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';

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

  describe('createSong', () => {
    it('successfully creates a song in the database', async () => {
      const song = { title: 'Erlkonig', composer: 'Franz Schubert', accompaniments: [] };
      const createdSong = await createSong(song);
      expect(createdSong).toBeTruthy();
      expect(createdSong._id).toBeTruthy();
      const retrieved = await SongModel.findById(createdSong._id);
      expect(retrieved.title).toEqual(song.title);
      expect(retrieved.composer).toEqual(song.composer);
      expect(retrieved.accompaniments).toEqual([]);
    });
  });

  describe('getSongAtIde', () => {
    it('retrieves the song at the given _id', async () => {
      const songData = { title: 'Erlkonig', composer: 'Franz Schubert', accompaniments: [] };
      const validSong = new SongModel(songData);
      const savedSong = await validSong.save();
      const id = savedSong._id;
      const retrievedSong = await getSongAtId(id);
      expect(retrievedSong.title).toEqual(songData.title);
      expect(retrievedSong.composer).toEqual(songData.composer);
    });
  });

  describe('getAllSongs', () => {
    it('retrieves all the songs', async () => {
      const songData1 = { title: 'Erlkonig', composer: 'Franz Schubert' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert' };
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
