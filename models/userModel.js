import mongoose from 'mongoose';

const userModel = new mongoose.Schema({
  email: {
    type: String, required: true, unique: true, index: true,
  },
  password: { type: String, required: true },
  name: { type: String, required: false },
  dateJoined: { type: Date, required: true },
  accompanimentSubmissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
  favoriteSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  favoriteAccompaniments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
}, { collection: 'users' });
// eslint-disable-next-line new-cap
const UserModel = new mongoose.model('User', userModel);

export default UserModel;
