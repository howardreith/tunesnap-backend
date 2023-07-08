import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { clearDatabase, connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';
import UserModel from '../models/userModel';
import {
  registerUser,
  loginUser,
  updatePassword,
  addAccompanimentToCart,
  getCart,
  removeAccompanimentFromCart, getUserInfo,
} from './userService';
import SongModel from '../models/songModel';
import { createAccompaniment } from './accompanimentService';
import * as s3Helpers from '../utils/s3Helpers';

describe('userService', () => {
  beforeAll(async () => {
    await connectToInMemoryDb();
  });

  afterAll(async () => {
    await disconnectFromInMemoryDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  let stockUser;
  let stockUserPassword;
  let encryptedStockUserPassword;
  let savedStockUser;
  let userWhoWillCreateStuff;
  let savedSong;
  let accompanimentWithFileThatIsNotFree;
  beforeEach(async () => {
    process.env.JWT_SECRET = 'soSecret';
    s3Helpers.uploadFile = jest.fn().mockResolvedValue({ Location: 'https://fakeAmazonS3Url' });
    const salt = await bcrypt.genSalt(10);
    stockUserPassword = 'swiftTheFox';
    encryptedStockUserPassword = await bcrypt.hash(stockUserPassword, salt);
    stockUser = {
      email: 'David@gnome.com', password: encryptedStockUserPassword, dateJoined: new Date(), displayName: 'David the Gnome',
    };
    const stockUserModel = new UserModel(stockUser);
    savedStockUser = await stockUserModel.save();

    const userWhoWillCreateStuffData = {
      email: 'Lisa@gnome.com',
      password: 'lisa',
      displayName: 'Lisa the Gnome',
      dateJoined: new Date(),
      accompanimentsOwned: [],
      accompanimentSubmissions: [],
    };
    const userModelForCreator = new UserModel(userWhoWillCreateStuffData);
    userWhoWillCreateStuff = await userModelForCreator.save();
    const songData = {
      title: 'Erlkonig',
      composer: 'Franz Schubert',
      accompaniments: [],
    };
    const validSong = new SongModel(songData);
    savedSong = await validSong.save();

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

    const { song: updatedSong } = await createAccompaniment(
      accompanimentWithFileThatIsNotFreeData,
      userWhoWillCreateStuff._id,
      nonFreeFileData,
    );

    [accompanimentWithFileThatIsNotFree] = updatedSong.accompaniments;
  });

  describe('signupUser', () => {
    it('should throw if the user already exists', async () => {
      await expect(registerUser(stockUser.email, 'password')).rejects.toThrowError('User already exists');
    });

    it('should create a user in the db', async () => {
      const result = await registerUser('Swift@gnome.com', 'david', 'Swift the Fox');
      const newUser = await UserModel.find({ email: 'Swift@gnome.com' });
      expect(newUser[0]).toBeTruthy();
      expect(newUser[0]._id).toEqual(result._id);
      expect(newUser[0]._id).toBeTruthy();
    });

    it('should return the user info but without the password', async () => {
      const result = await registerUser('Swift@gnome.com', 'david', 'Swift the Fox');
      expect(result.email).toEqual('Swift@gnome.com');
      expect(result._id).toBeTruthy();
      expect(result.password).toBeUndefined();
      expect(result.accompanimentSubmissions).toEqual([]);
      expect(result.favoriteSongs).toEqual([]);
      expect(result.favoriteAccompaniments).toEqual([]);
    });
  });

  describe('loginUser', () => {
    it('should throw if the user is not found', async () => {
      await expect(loginUser('nobody@nowhere.com', 'password')).rejects.toThrowError('User not found');
    });

    it('should throw with an invalid password', async () => {
      await expect(loginUser(stockUser.email, 'incorrectPassword')).rejects.toThrowError('Invalid Password');
    });

    it('should return the user info and the token with successful login', async () => {
      const result = await loginUser(stockUser.email, stockUserPassword);
      expect(result._id).toBeTruthy();
      expect(result.email).toEqual(stockUser.email);
      expect(result.password).toBeUndefined();
      expect(result.accompanimentSubmissions).toEqual([]);
      expect(result.favoriteSongs).toEqual([]);
      expect(result.favoriteAccompaniments).toEqual([]);
      expect(result.token).toBeTruthy();
      const decoded = jwt.decode(result.token);
      expect(decoded.id).toEqual(savedStockUser._id.toString());
    });
  });

  describe('getUserInfo', () => {
    it('should throw without an id', async () => {
      await expect(getUserInfo()).rejects.toThrowError('ID is required');
    });

    it('should throw if user not found', async () => {
      await expect(getUserInfo('6215150ffadb1b70464f03f0')).rejects.toThrowError('User not found');
    });

    it('should return the user info', async () => {
      const result = await getUserInfo(savedStockUser._id);
      const expected = {
        _id: savedStockUser._id.toString(),
        accompanimentSubmissions: [],
        accompanimentsOwned: [],
        cart: [],
        displayName: savedStockUser.displayName,
        email: savedStockUser.email,
        favoriteAccompaniments: [],
        requestedAccompaniments: [],
        favoriteSongs: [],
      };
      expect(result).toEqual(expected);
    });
  });

  describe('updatePassword', () => {
    it('should throw with an invalid user id', async () => {
      await expect(updatePassword(
        'myNewPassword',
        'aninvalidIdd',
      ))
        .rejects.toThrowError('User at ID aninvalidIdd not found');
    });

    it('should update the password with a new encrypted password', async () => {
      const result = await updatePassword('myNewPassword', savedStockUser._id.toString());
      const updated = await UserModel.findById(savedStockUser._id);

      expect(result).toEqual(savedStockUser._id.toString());
      expect(updated.password).toBeTruthy();
      expect(savedStockUser.password).not.toEqual(updated.password);
    });
  });

  describe('addAccompanimentToCart', () => {
    it('should add an accompaniment to the cart', async () => {
      const result = await addAccompanimentToCart(accompanimentWithFileThatIsNotFree._id.toString(), savedStockUser._id.toString());
      expect(result.length).toEqual(1);
      expect(result[0].toString()).toEqual(accompanimentWithFileThatIsNotFree._id.toString());

      const updated = await UserModel.findById(savedStockUser._id);
      expect(updated.cart.length).toEqual(1);
      expect(updated.cart[0].toString())
        .toEqual(accompanimentWithFileThatIsNotFree._id.toString());
    });

    it('should add an accompaniment to a cart that already has accompaniments', async () => {
      await addAccompanimentToCart(accompanimentWithFileThatIsNotFree._id.toString(), savedStockUser._id.toString());
      const accompanimentWithFileThatIsNotFreeDataPart2 = {
        songId: savedSong._id,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 10,
        currency: 'USD',
      };
      const nonFreeFileDataPart2 = {
        originalname: 'testFile4.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };

      const { song: updatedSong2 } = await createAccompaniment(
        accompanimentWithFileThatIsNotFreeDataPart2,
        userWhoWillCreateStuff._id,
        nonFreeFileDataPart2,
      );

      let accompanimentWithFileThatIsNotFreePart2;
      [accompanimentWithFileThatIsNotFree,
        accompanimentWithFileThatIsNotFreePart2] = updatedSong2.accompaniments;

      // Now the actual test
      const result = await addAccompanimentToCart(accompanimentWithFileThatIsNotFreePart2._id.toString(), savedStockUser._id.toString());
      expect(result.length).toEqual(2);
      expect(result[1].toString()).toEqual(accompanimentWithFileThatIsNotFreePart2._id.toString());

      const updated = await UserModel.findById(savedStockUser._id);
      expect(updated.cart.length).toEqual(2);
      expect(updated.cart[1].toString())
        .toEqual(accompanimentWithFileThatIsNotFreePart2._id.toString());
    });

    it('should throw if the accompaniment is already in the cart', async () => {
      await addAccompanimentToCart(accompanimentWithFileThatIsNotFree._id.toString(), savedStockUser._id.toString());
      await expect(addAccompanimentToCart(accompanimentWithFileThatIsNotFree._id.toString(), savedStockUser._id.toString())).rejects.toThrowError('Accompaniment already in cart.');
    });
  });

  describe('removeAccompanimentFromCart', () => {
    let initialAccompanimentInCart;
    beforeEach(async () => {
      [initialAccompanimentInCart] = await addAccompanimentToCart(accompanimentWithFileThatIsNotFree._id.toString(), savedStockUser._id.toString());
    });
    it('removes the accompanimentFromCart', async () => {
      const initial = await UserModel.findById(savedStockUser._id);
      expect(initial.cart.length).toEqual(1);
      const result = await removeAccompanimentFromCart(initialAccompanimentInCart._id.toString(), savedStockUser._id.toString());
      const updated = await UserModel.findById(savedStockUser._id);
      expect(updated.cart.length).toEqual(0);
      expect(result).toEqual([]);
    });

    it('only removes the correct accompaniment', async () => {
      const accompanimentWithFileThatIsNotFreeDataPart2 = {
        songId: savedSong._id,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        price: 10,
        currency: 'USD',
      };
      const nonFreeFileDataPart2 = {
        originalname: 'testFile4.mp3',
        mimetype: 'mp3',
        size: '1mb',
      };

      const { song: updatedSong2 } = await createAccompaniment(
        accompanimentWithFileThatIsNotFreeDataPart2,
        userWhoWillCreateStuff._id,
        nonFreeFileDataPart2,
      );

      let initialAccompanimentTwo;
      [initialAccompanimentInCart,
        initialAccompanimentTwo] = updatedSong2.accompaniments;
      await addAccompanimentToCart(initialAccompanimentTwo._id.toString(), savedStockUser._id.toString());

      const initial = await UserModel.findById(savedStockUser._id);
      expect(initial.cart.length).toEqual(2);
      const result = await removeAccompanimentFromCart(initialAccompanimentInCart._id.toString(), savedStockUser._id.toString());
      const updated = await UserModel.findById(savedStockUser._id);
      expect(updated.cart.length).toEqual(1);
      expect(updated.cart[0]._id).toEqual(initialAccompanimentTwo._id);
      expect(result[0]._id).toEqual(initialAccompanimentTwo._id);
      const expected = [
        {
          _id: initialAccompanimentTwo._id,
          song: {
            title: 'Erlkonig',
            composer: 'Franz Schubert',
            _id: savedSong._id,
          },
          price: 10,
          artist: undefined,
          key: undefined,
          dateCreated: initialAccompanimentTwo.dateCreated,
          dateUpdated: initialAccompanimentTwo.dateUpdated,
          file: {
            originalFilename: 'testFile4.mp3',
            mimetype: 'mp3',
            _id: expect.anything(),
          },
          addedBy: userWhoWillCreateStuff._id,
        },
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('getCart', () => {
    beforeEach(async () => {
      await addAccompanimentToCart(accompanimentWithFileThatIsNotFree._id.toString(), savedStockUser._id.toString());
    });

    it('returns the cart with filtered values', async () => {
      const result = await getCart(savedStockUser._id.toString());
      const expected = [{
        _id: accompanimentWithFileThatIsNotFree._id,
        song: {
          title: savedSong.title,
          composer: savedSong.composer,
          _id: savedSong._id,
        },
        price: accompanimentWithFileThatIsNotFree.price,
        artist: accompanimentWithFileThatIsNotFree.artist,
        key: accompanimentWithFileThatIsNotFree.key,
        dateCreated: accompanimentWithFileThatIsNotFree.dateCreated,
        dateUpdated: accompanimentWithFileThatIsNotFree.dateUpdated,
        file: {
          originalFilename: accompanimentWithFileThatIsNotFree.file.originalFilename,
          mimetype: accompanimentWithFileThatIsNotFree.file.mimetype,
          _id: accompanimentWithFileThatIsNotFree.file._id,
        },
        addedBy: userWhoWillCreateStuff._id,
      }];
      expect(result).toEqual(expected);
      expect(result[0].file.url).toBeUndefined();
      expect(result[0].file.s3Key).toBeUndefined();
    });
  });
});
