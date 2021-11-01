import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToInMemoryDb, disconnectFromInMemoryDb } from '../utils/testHelpers';
import UserModel from '../models/userModel';
import { registerUser, loginUser } from './userService';

describe('userService', () => {
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

  let stockUser;
  let stockUserPassword;
  let encryptedStockUserPassword;
  let savedStockUser;
  beforeEach(async () => {
    process.env.JWT_SECRET = 'soSecret';
    const salt = await bcrypt.genSalt(10);
    stockUserPassword = 'swiftTheFox';
    encryptedStockUserPassword = await bcrypt.hash(stockUserPassword, salt);
    stockUser = { email: 'David@gnome.com', password: encryptedStockUserPassword, dateJoined: new Date() };
    const stockUserModel = new UserModel(stockUser);
    savedStockUser = await stockUserModel.save();
  });

  describe('signupUser', () => {
    it('should throw if the user already exists', async () => {
      await expect(registerUser(stockUser.email, 'password')).rejects.toThrowError('User already exists');
    });

    it('should create a user in the db', async () => {
      const result = await registerUser('Lisa@gnome.com', 'mice');
      const newUser = await UserModel.find({ email: 'Lisa@gnome.com' });
      expect(newUser[0]).toBeTruthy();
      expect(newUser[0]._id).toEqual(result._id);
      expect(newUser[0]._id).toBeTruthy();
    });

    it('should return the user info but without the password', async () => {
      const result = await registerUser('Lisa@gnome.com', 'mice');
      expect(result.email).toEqual('Lisa@gnome.com');
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
});
