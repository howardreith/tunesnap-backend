import mongoose from 'mongoose';

export const accompanimentsOwnedSchema = new mongoose.Schema({
  accompaniment: { type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment', required: true },
  pricePaid: { type: Number, required: true },
  currency: { type: String, required: true },
  dateOfPurchase: { type: Date, required: true },
});

const userModel = new mongoose.Schema({
  email: {
    type: String, required: true, unique: true, index: true,
  },
  password: { type: String, required: true },
  name: { type: String, required: false },
  displayName: { type: String, required: true },
  dateJoined: { type: Date, required: true },
  accompanimentSubmissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
  accompanimentsOwned: [{ type: accompanimentsOwnedSchema }],
  purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }],
  favoriteSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  favoriteAccompaniments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
}, { collection: 'users' });
// eslint-disable-next-line new-cap
const UserModel = new mongoose.model('User', userModel);

export default UserModel;
