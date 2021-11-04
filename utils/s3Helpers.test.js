import AWS from 'aws-sdk';
import { getFileAndAddItToResponse, uploadFile } from './s3Helpers';

describe('s3Helpers', () => {
  let mockUpload;

  beforeEach(() => {
    mockUpload = jest.spyOn(AWS.S3.prototype, 'upload');
    mockUpload.mockReturnValue({ promise: jest.fn() });
  });

  describe('uploadFile', () => {
    it('should upload the file to s3', async () => {
      // eslint-disable-next-line global-require
      const file = { path: '\\tmp\\dbfe4d05fe7ff846acf73ea416edeefe', filename: 'aNicefilename', mimetype: 'mp3' };
      await uploadFile(file);
      const expected = {
        Key: 'aNicefilename',
        Bucket: 'media.tunesnap',
      };
      expect(mockUpload).toHaveBeenCalledWith(expect.objectContaining(expected));
      // Not going to test a return value as that would basically be testing my mock,
      // but it should look like the following:
      //   const expected = {
      //     ETag: '"3d9b3f65480ed094c0920feefec9c22a"',
      //     Location: 'https://s3.amazonaws.com/media.tunesnap/aNicefilename',
      //     Key: 'aNicefilename',
      //     Bucket: 'media.tunesnap',
      //   };
    });
  });

  describe('getFileAndAddItToResponse', () => {
    it('should send along the file', async () => {
      const fileData = { originalFileName: 'aHappyFile.mp3', s3Key: 'anS3Key' };
      const res = {
        attachment: jest.fn(), on: jest.fn(), once: jest.fn(), emit: jest.fn(),
      };
      await getFileAndAddItToResponse(fileData, res);
      expect(res.on).toHaveBeenCalled();
      expect(res.emit).toHaveBeenCalled();
      expect(res.once).toHaveBeenCalled();
    });
  });
});
