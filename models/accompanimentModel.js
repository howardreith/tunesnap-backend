import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  raterId: mongoose.Schema.Types.ObjectId,
  rating: Number,
});

const fileSchema = new mongoose.Schema({
  originalFilename: String,
  mimetype: String,
  size: String,
  url: { type: String, required: true },
  s3Key: String,
});

const accompanimentModel = new mongoose.Schema({
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  url: { type: String, required: false },
  artist: { type: String, required: false },
  dateCreated: { type: Date, required: true },
  dateUpdated: { type: Date, required: true },
  price: { type: String, required: false },
  key: { type: String, required: false },
  file: { type: fileSchema, required: false },
  ratings: [{ type: ratingSchema, default: {} }],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
// eslint-disable-next-line new-cap
const AccompanimentModel = new mongoose.model('Accompaniment', accompanimentModel);
export default AccompanimentModel;
