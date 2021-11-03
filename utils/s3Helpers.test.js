import { uploadFile } from './s3Helpers';

const mS3Instance = {
  upload: jest.fn().mockReturnThis(),
  promise: jest.fn(),
};

jest.mock('aws-sdk', () => ({ S3: jest.fn(() => mS3Instance) }));

describe('s3Helpers', () => {
  describe('uploadFile', () => {
    it('should upload the file to s3', async () => {
      // eslint-disable-next-line global-require
      const file = { path: '\\tmp\\dbfe4d05fe7ff846acf73ea416edeefe', filename: 'aNicefilename', mimetype: 'mp3' };
      const result = await uploadFile(file);
      const expected = {
        ETag: '"3d9b3f65480ed094c0920feefec9c22a"',
        Location: 'https://s3.amazonaws.com/media.tunesnap/aNicefilename',
        key: 'aNicefilename',
        Key: 'aNicefilename',
        Bucket: 'media.tunesnap',
      };
      expect(result).toEqual(expected);
    });
  });
});
