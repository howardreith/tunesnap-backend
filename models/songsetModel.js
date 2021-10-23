import mongoose from 'mongoose';

const songsetModel = new mongoose.Schema({
  setTitle: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  compositionDate: { type: Date, required: false },
});
// eslint-disable-next-line new-cap
const SongsetModel = new mongoose.model('Songset', songsetModel);
export default SongsetModel;
