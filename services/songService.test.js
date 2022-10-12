import mongoose from 'mongoose';
import {
  createSong,
  getSongAtId,
  getAllSongs,
  getSongViaAutocomplete,
  addAccompanimentRequestForSong,
  deleteAccompanimentRequestForSong,
  getSongsSortedByNumberOfRequests,
} from './songService.js';
// Import this so accompaniment model is added and song model can use it
// eslint-disable-next-line no-unused-vars
import AccompanimentModel from '../models/accompanimentModel.js';
import SongModel from '../models/songModel.js';
import { connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers.js';
import UserModel from '../models/userModel.js';
import { clearCache } from '../utils/songHelpers.js';

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
      expect(result[0].songId.toString()).toEqual(expected);
      const updatedUser = await UserModel.findById(savedUser.id);
      expect(updatedUser.requestedAccompaniments[0].songId.toString()).toEqual(expected);
      const updatedSong = await SongModel.findById(savedSong.id);
      const expectedSongData = savedUser.id.toString();
      expect(updatedSong.accompanimentRequests[0].userId.toString()).toEqual(expectedSongData);
    });
  });

  describe('deleteAccompanimentRequestForSong', () => {
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

      await SongModel.findByIdAndUpdate(
        savedSong.id,
        { accompanimentRequests: [{ userId: savedUser.id, dateCreated: new Date() }] },
      );
      await UserModel.findByIdAndUpdate(
        savedUser.id,
        { requestedAccompaniments: [{ songId: savedSong.id, dateCreated: new Date() }] },
      );
    });

    it('successfully removes an accompaniment request from a song', async () => {
      const initialUser = await UserModel.findById(savedUser.id);
      expect(initialUser.requestedAccompaniments.length).toEqual(1);
      const initialSong = await SongModel.findById(savedSong.id);
      expect(initialSong.accompanimentRequests.length).toEqual(1);
      const result = await deleteAccompanimentRequestForSong({ id: savedSong.id }, savedUser.id);
      expect(result).toEqual([]);
      const updatedUser = await UserModel.findById(savedUser.id);
      expect(updatedUser.requestedAccompaniments).toEqual([]);
      const updatedSong = await SongModel.findById(savedSong.id);
      expect(updatedSong.accompanimentRequests).toEqual([]);
    });
  });

  describe('getSongsByNumberOfRequests', () => {
    let savedUser;
    let savedSong;
    let savedSong2;
    let savedSong3;
    const userData = {
      email: 'david@gnome.com',
      password: 'anEncryptedPassword',
      displayName: 'David The Gnome',
      dateJoined: new Date(),
    };
    let validUser;
    const songData = {
      title: 'Erlkonig',
      composer: 'Franz Schubert',
      accompaniments: [],
    };
    let validSong;
    beforeEach(async () => {
      clearCache();
      validUser = new UserModel(userData);
      savedUser = await validUser.save();
      const validUser2 = new UserModel({
        email: 'lisa@gnome.com',
        password: 'anEncryptedPassword',
        displayName: 'Lisa The Gnome',
        dateJoined: new Date(),
      });
      const savedUser2 = await validUser2.save();
      const validUser3 = new UserModel({
        email: 'swift@fox.com',
        password: 'anEncryptedPassword',
        displayName: 'Swift The Fox',
        dateJoined: new Date(),
      });
      const savedUser3 = await validUser3.save();
      validSong = new SongModel(songData);
      savedSong = await validSong.save();
      const validSong2 = new SongModel({
        title: 'Der Lindenbaum',
        composer: 'Franz Schubert',
        accompaniments: [],
      });
      savedSong2 = await validSong2.save();
      const validSong3 = new SongModel({
        title: 'Der Leiermann',
        composer: 'Franz Schubert',
        accompaniments: [],
      });
      savedSong3 = await validSong3.save();
      await SongModel.findByIdAndUpdate(
        savedSong.id,
        {
          accompanimentRequests: [
            { userId: savedUser2.id, dateCreated: new Date() },
            { userId: savedUser3.id, dateCreated: new Date() },
          ],
        },
      );
      await SongModel.findByIdAndUpdate(
        savedSong2.id,
        {
          accompanimentRequests: [
            { userId: savedUser2.id, dateCreated: new Date() },
          ],
        },
      );
      await UserModel.findByIdAndUpdate(
        savedUser2.id,
        {
          requestedAccompaniments: [
            { songId: savedSong.id, dateCreated: new Date() },
            { songId: savedSong2.id, dateCreated: new Date() }],
        },
      );
      await UserModel.findByIdAndUpdate(
        savedUser3.id,
        { requestedAccompaniments: [{ songId: savedSong.id, dateCreated: new Date() }] },
      );
    });

    it('returns songs sorted by number of accompaniment requests', async () => {
      const result = await getSongsSortedByNumberOfRequests();
      const resultSongIds = result.accompanimentRequestsPage.map((song) => song._id.toString());
      expect(resultSongIds.includes(savedSong3._id.toString())).toBeFalsy();
      expect(resultSongIds[0]).toEqual(savedSong._id.toString());
      expect(resultSongIds[1]).toEqual(savedSong2._id.toString());
    });

    it('returns the total length of the songs that have requests', async () => {
      const result = await getSongsSortedByNumberOfRequests();
      expect(result.totalLength).toEqual(2);
    });

    it('returns the songs sorted by recency when that prop is true', async () => {
      const result = await getSongsSortedByNumberOfRequests({ page: 1 }, true);
      const resultSongIds = result.accompanimentRequestsPage.map((song) => song._id.toString());
      expect(resultSongIds.includes(savedSong3._id.toString())).toBeFalsy();
      expect(resultSongIds[0]).toEqual(savedSong2._id.toString());
      expect(resultSongIds[1]).toEqual(savedSong._id.toString());
    });

    describe('pagination', () => {
      let tempSong9;
      beforeEach(async () => {
        const tempSong1 = await new SongModel({
          title: 'blah1',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong2 = await new SongModel({
          title: 'blah2',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong3 = await new SongModel({
          title: 'blah3',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong4 = await new SongModel({
          title: 'blah4',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong5 = await new SongModel({
          title: 'blah5',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong6 = await new SongModel({
          title: 'blah6',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong7 = await new SongModel({
          title: 'blah7',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong8 = await new SongModel({
          title: 'blah8',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        tempSong9 = await new SongModel({
          title: 'blah9',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        const tempSong10 = await new SongModel({
          title: 'blah10',
          composer: 'Franz Schubert',
          accompaniments: [],
        }).save();
        await Promise.all(
          [tempSong1, tempSong2, tempSong3, tempSong4, tempSong5,
            tempSong6, tempSong7, tempSong8, tempSong9, tempSong10]
            .map(async (song) => {
              await SongModel.findByIdAndUpdate(
                song.id,
                {
                  accompanimentRequests: [
                    { userId: savedUser.id, dateCreated: new Date() },
                  ],
                },
              );
            }),
        );
      });
      it('will be performed when variable not passed in', async () => {
        const result = await getSongsSortedByNumberOfRequests();
        expect(result.totalLength).toEqual(12);
        expect(result.accompanimentRequestsPage.length).toEqual(10);
        expect(result.accompanimentRequestsPage[0]._id.toString())
          .toEqual(savedSong._id.toString());
      });

      it('will be performed when variable passed in', async () => {
        const result = await getSongsSortedByNumberOfRequests({ page: 2 });
        expect(result.totalLength).toEqual(12);
        expect(result.accompanimentRequestsPage.length).toEqual(2);
        expect(result.accompanimentRequestsPage[0]._id.toString())
          .not.toEqual(savedSong._id.toString());
        expect(result.accompanimentRequestsPage[0]._id.toString())
          .toEqual(tempSong9._id.toString());
      });
    });
  });
});
