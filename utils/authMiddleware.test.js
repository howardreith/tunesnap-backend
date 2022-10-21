import jwt from 'jsonwebtoken';
import protectEndpoint, { protectEndpointIfFileAndNotFree } from './authMiddleware';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from './testHelpers';
import UserModel from '../models/userModel';
import SongModel from '../models/songModel';
import { createAccompaniment } from '../services/accompanimentService';
import * as s3Helpers from './s3Helpers';
import { generateToken } from './authHelpers';

describe('authMiddleware', () => {
  describe('protectEndpoint', () => {
    let next;
    let defaultRequest;
    let defaultToken;
    let id;

    beforeEach(() => {
      process.env.JWT_SECRET = 'superSecret';
      next = jest.fn();
      id = 'aFakeUserId';
      defaultToken = jwt.sign({ id }, process.env.JWT_SECRET);
      defaultRequest = {
        headers: {
          authorization: `Bearer ${defaultToken}`,
        },
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should respond with a 401 if there is no authorization header', () => {
      global.console.error = jest.fn();
      const req = { headers: {} };
      const sendMock = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ send: sendMock }) };
      protectEndpoint(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ status: 'Unauthorized', data: 'No token included in request' });
    });

    it('should respond with a 401 if the token is invalid', () => {
      global.console.error = jest.fn();
      const badToken = jwt.sign({ id }, 'anincorrectSecret');
      const req = { headers: { authorization: `Bearer ${badToken}` } };
      const sendMock = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ send: sendMock }) };
      protectEndpoint(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ status: 'Unauthorized', data: 'Invalid token' });
    });

    it('should call next if the token is verified', () => {
      const sendMock = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ send: sendMock }) };
      protectEndpoint(defaultRequest, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('protectEndpointIfFileAndNotFree', () => {
    beforeAll(async () => {
      await connectToInMemoryDb();
    });

    afterAll(async () => {
      await disconnectFromInMemoryDb();
    });

    afterEach(async () => {
      await clearDatabase();
    });

    let userWhoWillCreateStuff;
    let userWhoWillTryToAccessStuff;
    let userWhoWillTryToAccessStuffToken;
    let savedSong;
    let accompanimentWithUrlAndNoFileThatIsFree;
    let accompanimentWithUrlAndNoFileThatIsNotFree;
    let accompanimentWithFileThatIsFree;
    let accompanimentWithFileThatIsNotFree;
    let accompanimentWithFileThatIsNotFreeButIsOwned;
    // No token with each of these. Yes token with each of these.
    beforeEach(async () => {
      // eslint-disable-next-line no-import-assign
      s3Helpers.uploadFile = jest.fn().mockResolvedValue({ Location: 'https://fakeAmazonS3Url' });

      const userWhoWillCreateStuffData = {
        email: 'David@gnome.com',
        password: 'david',
        displayName: 'David the Gnome',
        dateJoined: new Date(),
        accompanimentsOwned: [],
        accompanimentSubmissions: [],
      };
      const userWhoWillAccessStuffData = {
        email: 'Lisa@gnome.com',
        password: 'lisa',
        displayName: 'Lisa the Gnome',
        dateJoined: new Date(),
        accompanimentsOwned: [],
        accompanimentSubmissions: [],
      };
      const userModelForCreator = new UserModel(userWhoWillCreateStuffData);
      userWhoWillCreateStuff = await userModelForCreator.save();
      const userModelForAccessor = new UserModel(userWhoWillAccessStuffData);
      userWhoWillTryToAccessStuff = await userModelForAccessor.save();

      userWhoWillTryToAccessStuffToken = generateToken(userWhoWillTryToAccessStuff._id);
      const songData = {
        title: 'Erlkonig',
        composer: 'Franz Schubert',
        accompaniments: [],
      };
      const validSong = new SongModel(songData);
      savedSong = await validSong.save();

      const accompanimentWithUrlAndNoFileThatIsFreeData = {
        songId: savedSong._id,
        url: 'https://youtube.com/fj3489f',
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 0,
        currency: 'USD',
      };
      await createAccompaniment(
        accompanimentWithUrlAndNoFileThatIsFreeData,
        userWhoWillCreateStuff._id,
        null,
      );

      const accompanimentWithUrlAndNoFileThatIsNotFreeData = {
        songId: savedSong._id,
        url: 'https://youtube.com/fj34858',
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 5,
        currency: 'USD',
      };
      await createAccompaniment(
        accompanimentWithUrlAndNoFileThatIsNotFreeData,
        userWhoWillCreateStuff._id,
        null,
      );

      const accompanimentWithFileThatIsFreeData = {
        songId: savedSong._id,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 0,
        currency: 'USD',
      };
      const freeFileData = {
        originalname: 'testFile.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };

      await createAccompaniment(
        accompanimentWithFileThatIsFreeData,
        userWhoWillCreateStuff._id,
        freeFileData,
      );

      const accompanimentWithFileThatIsNotFreeData = {
        songId: savedSong._id,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 5,
        currency: 'USD',
      };
      const nonFreeFileData = {
        originalname: 'testFile3.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };

      await createAccompaniment(
        accompanimentWithFileThatIsNotFreeData,
        userWhoWillCreateStuff._id,
        nonFreeFileData,
      );

      const accompanimentWithFileThatIsNotFreebutOwnedData = {
        songId: savedSong._id,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 5,
        currency: 'USD',
      };
      const nonFreeButOwnedFileData = {
        originalname: 'testFile3.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };

      const { song: updatedSong } = await createAccompaniment(
        accompanimentWithFileThatIsNotFreebutOwnedData,
        userWhoWillCreateStuff._id,
        nonFreeButOwnedFileData,
      );

      [
        accompanimentWithUrlAndNoFileThatIsFree,
        accompanimentWithUrlAndNoFileThatIsNotFree,
        accompanimentWithFileThatIsFree,
        accompanimentWithFileThatIsNotFree,
        accompanimentWithFileThatIsNotFreeButIsOwned,
      ] = updatedSong.accompaniments;

      const ownedAccompaniments = [];
      const purchase = {
        accompaniment: accompanimentWithFileThatIsNotFreeButIsOwned._id,
        pricePaid: 0,
        currency: 'USD',
        dateOfPurchase: new Date(),
      };
      ownedAccompaniments.push(purchase);
      userWhoWillTryToAccessStuff = await UserModel
        .findByIdAndUpdate(
          userWhoWillTryToAccessStuff._id,
          { accompanimentsOwned: ownedAccompaniments },
        );
    });

    it('allows access to free external accompaniment with no token', async () => {
      const req = { params: { id: accompanimentWithUrlAndNoFileThatIsFree._id } };
      const res = {};
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows access to free external accompaniment with token', async () => {
      const req = {
        params: { id: accompanimentWithUrlAndNoFileThatIsFree._id },
        headers: { authorization: `Bearer ${userWhoWillTryToAccessStuffToken}` },
      };
      const res = {};
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows access to non-free external accompaniment with no token', async () => {
      const req = { params: { id: accompanimentWithUrlAndNoFileThatIsNotFree._id } };
      const res = {};
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows access to non-free external accompaniment with token', async () => {
      const req = {
        params: { id: accompanimentWithUrlAndNoFileThatIsNotFree._id },
        headers: { authorization: `Bearer ${userWhoWillTryToAccessStuffToken}` },
      };
      const res = {};
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows access to free internal accompaniment with no token', async () => {
      const req = { params: { id: accompanimentWithFileThatIsFree._id } };
      const res = {};
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows access to free internal accompaniment with token', async () => {
      const req = {
        params: { id: accompanimentWithFileThatIsFree._id },
        headers: { authorization: `Bearer ${userWhoWillTryToAccessStuffToken}` },
      };
      const res = {};
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('blocks access to non-free internal accompaniment with no token', async () => {
      const req = { params: { id: accompanimentWithFileThatIsNotFree._id } };
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock };
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ data: 'User is not logged in', status: 'Unauthorized' });
    });

    it('blocks access to non-free internal accompaniment with token of user without ownership', async () => {
      const req = {
        params: { id: accompanimentWithFileThatIsNotFree._id },
        headers: { authorization: `Bearer ${userWhoWillTryToAccessStuffToken}` },
      };
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock };
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock)
        .toHaveBeenCalledWith({ data: `User does not own ${accompanimentWithFileThatIsNotFree._id}`, status: 'Unauthorized' });
    });

    it('allows access to non-free internal accompaniment with token of user with ownership', async () => {
      const req = {
        params: { id: accompanimentWithFileThatIsNotFreeButIsOwned._id },
        headers: { authorization: `Bearer ${userWhoWillTryToAccessStuffToken}` },
      };
      const sendMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ send: sendMock });
      const res = { status: statusMock };
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalledWith(401);
    });

    it('should respond with a 401 if the token is invalid', async () => {
      global.console.error = jest.fn();
      const badToken = jwt.sign({ id: userWhoWillTryToAccessStuff }, 'anincorrectSecret');
      const req = {
        params: { id: accompanimentWithFileThatIsNotFree._id },
        headers: { authorization: `Bearer ${badToken}` },
      };
      const sendMock = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ send: sendMock }) };
      const next = jest.fn();
      await protectEndpointIfFileAndNotFree(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ status: 'Unauthorized', data: 'Invalid token' });
    });
  });
});
