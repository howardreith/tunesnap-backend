import bcrypt from 'bcrypt';
import UserModel from '../models/userModel.js';
import { generateToken } from '../utils/authHelpers.js';

export async function loginUser(email, password) {
  const user = (await UserModel.find({ email }))[0]; if (!user) {
    throw Error('User not found');
  }
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    throw Error('Invalid Password');
  } else {
    const token = generateToken(user._id);
    return {
      _id: user.id,
      email: user.email,
      accompanimentSubmissions: user.accompanimentSubmissions,
      favoriteSongs: user.favoriteSongs,
      favoriteAccompaniments: user.favoriteAccompaniments,
      token,
    };
  }
}

export async function registerUser(email, password) {
  const existingUser = await UserModel.find({ email });
  if (existingUser && existingUser.length > 0) {
    throw Error('User already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);
  const newUser = new UserModel({ email, password: encryptedPassword, dateJoined: new Date() });
  const savedUser = await newUser.save();
  // Making certain password is not returned
  return {
    _id: savedUser._id,
    email: savedUser.email,
    accompanimentSubmissions: savedUser.accompanimentSubmissions,
    favoriteSongs: savedUser.favoriteSongs,
    favoriteAccompaniments: savedUser.favoriteAccompaniments,
  };
}
