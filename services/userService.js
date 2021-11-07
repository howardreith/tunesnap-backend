import bcrypt from 'bcrypt';
import UserModel from '../models/userModel.js';
import { generateToken } from '../utils/authHelpers.js';

export async function loginUser(email, password) {
  const user = (await UserModel.find({ email }))[0];
  if (!user) {
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
      displayName: user.displayName,
      accompanimentSubmissions: user.accompanimentSubmissions,
      favoriteSongs: user.favoriteSongs,
      favoriteAccompaniments: user.favoriteAccompaniments,
      cart: user.cart,
      accompanimentsOwned: user.accompanimentsOwned,
      token,
    };
  }
}

export async function registerUser(email, password, displayName) {
  const existingUser = await UserModel.find({ email });
  if (existingUser && existingUser.length > 0) {
    throw Error('User already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);
  const newUser = new UserModel({
    email, password: encryptedPassword, dateJoined: new Date(), displayName,
  });
  const savedUser = await newUser.save();
  // Making certain password is not returned
  return {
    _id: savedUser._id,
    email: savedUser.email,
    displayName: savedUser.displayName,
    accompanimentSubmissions: savedUser.accompanimentSubmissions,
    favoriteSongs: savedUser.favoriteSongs,
    favoriteAccompaniments: savedUser.favoriteAccompaniments,
  };
}

export async function updatePassword(newPassword, userId) {
  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(newPassword, salt);
  const updateResult = await UserModel.findByIdAndUpdate(
    userId, { password: encryptedPassword },
  );
  if (!updateResult) {
    throw Error(`User at ID ${userId} not found`);
  }
  return updateResult._id.toString();
}

export async function addAccompanimentToCart(accompanimentId, userId) {
  const user = await UserModel.findById(userId);
  const currentCart = [...user.cart].filter((accomp) => accomp);
  currentCart.forEach((accompInCart) => {
    if (accompInCart
      && (accompInCart === accompanimentId || accompInCart.toString() === accompanimentId)) {
      throw Error('Accompaniment already in cart.');
    }
  });
  currentCart.push(accompanimentId);
  await UserModel.findByIdAndUpdate(userId, { cart: currentCart });
  const updatedUser = await UserModel.findById(userId);
  return updatedUser.cart;
}

export async function removeAccompanimentFromCart(accompanimentId, userId) {
  const user = await UserModel.findById(userId);
  const currentCart = [...user.cart].filter((accomp) => accomp);
  const updatedCart = currentCart.filter(
    (accomp) => accomp !== accompanimentId && accomp.toString() !== accompanimentId.toString(),
  );
  await UserModel.findByIdAndUpdate(userId, { cart: updatedCart });
  const updatedUser = await UserModel.findById(userId);
  await updatedUser.populate('cart');
  await updatedUser.populate('cart.songId');
  return updatedUser.cart.map((item) => ({
    _id: item._id,
    song: {
      title: item.songId.title,
      composer: item.songId.composer,
      _id: item.songId._id,
    },
    price: item.price,
    artist: item.artist,
    key: item.key,
    dateCreated: item.dateCreated,
    dateUpdated: item.dateUpdated,
    file: {
      originalFilename: item.file.originalFilename,
      mimetype: item.file.mimetype,
      _id: item.file._id,
    },
    addedBy: item.addedBy,
  }));
}

export async function getCart(userId) {
  const user = await UserModel.findById(userId);
  await user.populate('cart');
  await user.populate('cart.songId');
  return user.cart.map((item) => ({
    _id: item._id,
    song: {
      title: item.songId.title,
      composer: item.songId.composer,
      _id: item.songId._id,
    },
    price: item.price,
    artist: item.artist,
    key: item.key,
    dateCreated: item.dateCreated,
    dateUpdated: item.dateUpdated,
    file: {
      originalFilename: item.file.originalFilename,
      mimetype: item.file.mimetype,
      _id: item.file._id,
    },
    addedBy: item.addedBy,
  }));
}
