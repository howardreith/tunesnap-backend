import AWS from 'aws-sdk';
import fs from 'fs';
import { getFileAndAddItToResponse, uploadFile } from './s3Helpers';

describe('s3Helpers', () => {
  let mockUpload;

  beforeEach(async () => {
    mockUpload = jest.spyOn(AWS.S3.prototype, 'upload');
    mockUpload.mockReturnValue({ promise: jest.fn() });
  });

  describe('uploadFile', () => {
    it('should upload the file to s3 with its sample', async () => {
      // eslint-disable-next-line global-require
      const tempFilePath = `\\tmp\\${Math.random().toString(36).slice(2)}`;
      fs.copyFileSync('./utils/testMp3.mp3', tempFilePath);
      const file = { path: tempFilePath, filename: 'aNicefilename', mimetype: 'mp3' };
      await uploadFile(file);
      const expected = {
        Key: 'aNicefilename',
        Bucket: 'media.tunesnap',
      };
      const expectedSample = {
        Key: 'aNicefilename-sample',
        Bucket: 'media.tunesnap',
      };
      expect(mockUpload).toHaveBeenCalledWith(expect.objectContaining(expected));
      expect(mockUpload).toHaveBeenCalledWith(expect.objectContaining(expectedSample));
      // Not going to test a return value as that would basically be testing my mock,
      // but it should look like the following:
      //   const expected = {
      //     ETag: '"3d9b3f65480ed094c0920feefec9c22a"',
      //     Location: 'https://s3.amazonaws.com/media.tunesnap/aNicefilename',
      //     Key: 'aNicefilename',
      //     Bucket: 'media.tunesnap',
      //   };
    });

    it('should delete the temporary file after running', async () => {
      const tempFilePath = `\\tmp\\${Math.random().toString(36).slice(2)}`;
      fs.copyFileSync('./utils/testMp3.mp3', tempFilePath);
      const file = { path: tempFilePath, filename: 'aNicefilename', mimetype: 'mp3' };
      await uploadFile(file);
      expect(fs.existsSync(tempFilePath)).toBeFalsy();
    });
  });

  describe('getFileAndAddItToResponse', () => {
    it('should send along the file', async () => {
      const fileData = { originalFileName: 'aHappyFile.mp3', s3Key: 'anS3Key' };
      const res = {
        attachment: jest.fn(), on: jest.fn(), once: jest.fn(), emit: jest.fn(),
      };
      await getFileAndAddItToResponse(fileData.originalFileName, fileData.s3Key, res);
      expect(res.on).toHaveBeenCalled();
      expect(res.emit).toHaveBeenCalled();
      expect(res.once).toHaveBeenCalled();
    });
  });
});
