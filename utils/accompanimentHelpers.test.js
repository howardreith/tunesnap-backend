import { ObjectId } from 'mongodb';
import { getRatingData } from './accompanimentHelpers.js';

describe('accompanimentHelpers', () => {
  describe('getRatingData', () => {
    it('returns the rating data', () => {
      const accompaniment = {
        _id: new ObjectId('63836f2df6d4feba546dc82f'),
        songId: new ObjectId('63836f2df6d4feba546dc82d'),
        url: 'http://localhost:3000/songs/accompaniments/63836f2df6d4feba546dc82f',
        artist: 'David the Gnome',
        dateCreated: '2022-11-27T14:07:41.459Z',
        dateUpdated: '2022-11-27T14:07:41.459Z',
        price: 0,
        currency: 'USD',
        key: 'D Minor',
        file: {
          mimetype: 'mp3',
          size: '1000',
          url: 'https://amazonAwsLink',
          s3Key: 'e55543c697a1a74f31938af03359163c',
          _id: new ObjectId('63836f2df6d4feba546dc830'),
        },
        ratings: [
          {
            raterId: new ObjectId('63836f2df6d4feba546dc827'),
            rating: 5,
            _id: new ObjectId('63836f2df6d4feba546dc837'),
          },
          {
            raterId: new ObjectId('63836f2df6d4feba546dc828'),
            rating: 3,
            _id: new ObjectId('63836f2df6d4feba546dc838'),
          },
        ],
        addedBy: new ObjectId('63836f2df6d4feba546dc827'),
      };
      const userId = '63836f2df6d4feba546dc827';
      const result = getRatingData(accompaniment, userId);
      const expected = { averageRating: 4, userRating: 5 };
      expect(result).toEqual(expected);
    });

    it('returns null for userRating if no userId rating data', () => {
      const accompaniment = {
        _id: new ObjectId('63836f2df6d4feba546dc82f'),
        songId: new ObjectId('63836f2df6d4feba546dc82d'),
        url: 'http://localhost:3000/songs/accompaniments/63836f2df6d4feba546dc82f',
        artist: 'David the Gnome',
        dateCreated: '2022-11-27T14:07:41.459Z',
        dateUpdated: '2022-11-27T14:07:41.459Z',
        price: 0,
        currency: 'USD',
        key: 'D Minor',
        file: {
          mimetype: 'mp3',
          size: '1000',
          url: 'https://amazonAwsLink',
          s3Key: 'e55543c697a1a74f31938af03359163c',
          _id: new ObjectId('63836f2df6d4feba546dc830'),
        },
        ratings: [
          {
            raterId: new ObjectId('63836f2df6d4feba546dc827'),
            rating: 5,
            _id: new ObjectId('63836f2df6d4feba546dc837'),
          },
          {
            raterId: new ObjectId('63836f2df6d4feba546dc828'),
            rating: 3,
            _id: new ObjectId('63836f2df6d4feba546dc838'),
          },
        ],
        addedBy: new ObjectId('63836f2df6d4feba546dc827'),
      };
      const result = getRatingData(accompaniment);
      const expected = { averageRating: 4, userRating: null };
      expect(result).toEqual(expected);
    });

    it('returns null for userId if user has not rated', () => {
      const accompaniment = {
        _id: new ObjectId('63836f2df6d4feba546dc82f'),
        songId: new ObjectId('63836f2df6d4feba546dc82d'),
        url: 'http://localhost:3000/songs/accompaniments/63836f2df6d4feba546dc82f',
        artist: 'David the Gnome',
        dateCreated: '2022-11-27T14:07:41.459Z',
        dateUpdated: '2022-11-27T14:07:41.459Z',
        price: 0,
        currency: 'USD',
        key: 'D Minor',
        file: {
          mimetype: 'mp3',
          size: '1000',
          url: 'https://amazonAwsLink',
          s3Key: 'e55543c697a1a74f31938af03359163c',
          _id: new ObjectId('63836f2df6d4feba546dc830'),
        },
        ratings: [
          {
            raterId: new ObjectId('63836f2df6d4feba546dc827'),
            rating: 5,
            _id: new ObjectId('63836f2df6d4feba546dc837'),
          },
          {
            raterId: new ObjectId('63836f2df6d4feba546dc828'),
            rating: 3,
            _id: new ObjectId('63836f2df6d4feba546dc838'),
          },
        ],
        addedBy: new ObjectId('63836f2df6d4feba546dc827'),
      };
      const userId = '63836f2df6d4ffba546dc827';
      const result = getRatingData(accompaniment, userId);
      const expected = { averageRating: 4, userRating: null };
      expect(result).toEqual(expected);
    });
  });
});
