import mongoose from 'mongoose';

const accompanimentRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateCreated: { type: Date, required: true },
});

const songModel = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  composer: { type: String, required: true, index: true },
  lyricist: { type: String, required: false },
  compositionDate: { type: Date, required: false },
  opusNumber: { type: String, required: false },
  songCycle: { type: String, required: false },
  songCycleIndex: { type: String, required: false },
  textAndTranslation: { type: String, required: false },
  role: { type: String, required: false },
  fach: { type: String, required: false },
  accompaniments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
  accompanimentRequests: [{ type: accompanimentRequestSchema }],
}, { collection: 'songs' });
// eslint-disable-next-line new-cap
const SongModel = new mongoose.model('Song', songModel);

export default SongModel;
