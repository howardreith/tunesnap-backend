import mongoose from 'mongoose';
import {
  createSong, getSongAtId, getAllSongs, getSongViaAutocomplete, addAccompanimentRequestForSong,
} from './songService.js';
// Import this so accompaniment model is added and song model can use it
// eslint-disable-next-line no-unused-vars
import AccompanimentModel from '../models/accompanimentModel.js';
import SongModel from '../models/songModel.js';
import { connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers.js';
import UserModel from '../models/userModel.js';

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

  describe('getSongAtId', () => {
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

  describe('getSongViaAutocomplete', () => {
    it('should return all songs that match the value', async () => {
      const songData1 = { title: 'Erlkonig', composer: 'Franz Schubert' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      await validSong1.save();
      await validSong2.save();
      const input = {
        titleSearchValue: 'kon',
        composerSearchValue: '',
        songSetSearchValue: '',
        sortBy: 'title',
        page: 0,
      };
      const result = await getSongViaAutocomplete(input);
      expect(result).toEqual({
        numberOfSongs: 1,
        songs: [expect.objectContaining({ composer: 'Franz Schubert', title: 'Erlkonig' })],
      });
    });

    it('should return all songs that match the value despite accents', async () => {
      const songData1 = { title: 'Erlkönig', composer: 'Franz Schubert' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      await validSong1.save();
      await validSong2.save();
      const input = {
        titleSearchValue: 'kon',
        composerSearchValue: '',
        songSetSearchValue: '',
        sortBy: 'title',
        page: 0,
      };
      const result = await getSongViaAutocomplete(input, true);
      expect(result).toEqual({
        numberOfSongs: 1,
        songs: [expect.objectContaining({ composer: 'Franz Schubert', title: 'Erlkönig' })],
      });
    });

    it('should return all songs that match the composer', async () => {
      const songData1 = { title: 'Erlkönig', composer: 'Someone else' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      await validSong1.save();
      await validSong2.save();
      const input = {
        titleSearchValue: '',
        composerSearchValue: 'Schubert',
        songSetSearchValue: '',
        sortBy: 'title',
        page: 0,
      };
      const result = await getSongViaAutocomplete(input, true);
      expect(result).toEqual({
        numberOfSongs: 1,
        songs: [expect.objectContaining({ composer: 'Franz Schubert', title: 'Der Lindenbaum' })],
      });
    });

    it('should filter by both composer and title', async () => {
      const songData1 = { title: 'Erlkönig', composer: 'Franz Schubert' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert' };
      const songData3 = { title: 'Proud Songsters', composer: 'Gerald Finzi' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      const validSong3 = new SongModel(songData3);
      await validSong1.save();
      await validSong2.save();
      await validSong3.save();
      const input = {
        titleSearchValue: 'Erl',
        composerSearchValue: 'Schubert',
        songSetSearchValue: '',
        sortBy: 'title',
        page: 0,
      };
      const result = await getSongViaAutocomplete(input, true);
      expect(result).toEqual({
        numberOfSongs: 1,
        songs: [expect.objectContaining({ composer: 'Franz Schubert', title: 'Erlkönig' })],
      });
    });

    it('should filter by song cycle', async () => {
      const songData1 = { title: 'Erlkönig', composer: 'Franz Schubert' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert', songCycle: 'Winterreise' };
      const songData3 = { title: 'Proud Songsters', composer: 'Gerald Finzi', songCycle: 'Earth and Air and Rain' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      const validSong3 = new SongModel(songData3);
      await validSong1.save();
      await validSong2.save();
      await validSong3.save();
      const input = {
        titleSearchValue: '',
        composerSearchValue: '',
        songSetSearchValue: 'Winterreise',
        sortBy: 'title',
        page: 0,
      };
      const result = await getSongViaAutocomplete(input, true);
      expect(result).toEqual({
        numberOfSongs: 1,
        songs: [expect.objectContaining({ composer: 'Franz Schubert', title: 'Der Lindenbaum' })],
      });
    });

    it('should filter by song cycle, composer, and title', async () => {
      const songData1 = { title: 'Der Leiermann', composer: 'Franz Schubert', songCycle: 'Winterreise' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert', songCycle: 'Winterreise' };
      const songData3 = { title: 'Proud Songsters', composer: 'Gerald Finzi', songCycle: 'Earth and Air and Rain' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      const validSong3 = new SongModel(songData3);
      await validSong1.save();
      await validSong2.save();
      await validSong3.save();
      const input = {
        titleSearchValue: 'Lindenbaum',
        composerSearchValue: 'Schubert',
        songSetSearchValue: 'Winterreise',
        sortBy: 'title',
        page: 0,
      };
      const result = await getSongViaAutocomplete(input, true);
      expect(result).toEqual({
        numberOfSongs: 1,
        songs: [expect.objectContaining({ composer: 'Franz Schubert', title: 'Der Lindenbaum' })],
      });
    });

    it('should filter by song cycle, and composere', async () => {
      const songData1 = { title: 'Auf dem Flusse', composer: 'Reiner Bredemeyer', songCycle: 'Winterreise' };
      const songData2 = { title: 'Der Lindenbaum', composer: 'Franz Schubert', songCycle: 'Winterreise' };
      const songData3 = { title: 'Proud Songsters', composer: 'Gerald Finzi', songCycle: 'Earth and Air and Rain' };
      const validSong1 = new SongModel(songData1);
      const validSong2 = new SongModel(songData2);
      const validSong3 = new SongModel(songData3);
      await validSong1.save();
      await validSong2.save();
      await validSong3.save();
      const input = {
        titleSearchValue: '',
        composerSearchValue: 'Schubert',
        songSetSearchValue: 'Winterreise',
        sortBy: 'title',
        page: 0,
      };
      const result = await getSongViaAutocomplete(input, true);
      expect(result).toEqual({
        numberOfSongs: 1,
        songs: [expect.objectContaining({ composer: 'Franz Schubert', title: 'Der Lindenbaum' })],
      });
    });
  });

  describe('addAccompanimentRequestForSong', () => {
    let savedSong;
    let savedUser;
    beforeEach(async () => {
      const userData = {
        email: 'david@gnome.com',
        password: 'anEncryptedPassword',
        displayName: 'David The Gnome',
        dateJoined: new Date(),
      };
      const validUser = new UserModel(userData);
      savedUser = await validUser.save();
      const songData = {
        title: 'Erlkonig',
        composer: 'Franz Schubert',
        accompaniments: [],
      };
      const validSong = new SongModel(songData);
      savedSong = await validSong.save();
    });

    it('successfully adds an accompaniment request for a song', async () => {
      const result = await addAccompanimentRequestForSong({ id: savedSong.id }, savedUser.id);
      const expected = savedSong.id.toString();
      expect(result[0].toString()).toEqual(expected);
      const updatedUser = await UserModel.findById(savedUser.id);
      expect(updatedUser.requestedAccompaniments[0].toString()).toEqual(expected);
      const updatedSong = await SongModel.findById(savedSong.id);
      const expectedSongData = savedUser.id.toString();
      expect(updatedSong.accompanimentRequests[0].toString()).toEqual(expectedSongData);
    });
  });
});
