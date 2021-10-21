import mongoose from 'mongoose';

const accompanimentModel = new mongoose.Schema({
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  url: { type: String, required: true },
  performer: { type: String, required: false },
  dateCreated: { type: Date, required: false },
  price: { type: String, required: false },
  key: { type: String, required: false },
  rating: { type: Number, required: false },
});
// eslint-disable-next-line new-cap
const AccompanimentModel = new mongoose.model('Accompaniment', accompanimentModel);
export default AccompanimentModel;
