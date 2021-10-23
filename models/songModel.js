import mongoose from 'mongoose';

const songModel = new mongoose.Schema({
  title: { type: String, required: true },
  composer: { type: String, required: true },
  lyricist: { type: String, required: false },
  compositionDate: { type: Date, required: false },
  opus: { type: String, required: false },
  songSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'SongSet' },
  accompaniments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
});
// eslint-disable-next-line new-cap
const SongModel = new mongoose.model('Song', songModel);
export default SongModel;
