import mongoose from 'mongoose';
import atlasPlugin from 'mongoose-atlas-search';

const songModel = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  composer: { type: String, required: true, index: true },
  lyricist: { type: String, required: false },
  compositionDate: { type: Date, required: false },
  opusNumber: { type: String, required: false },
  songSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'SongSet' },
  songCycle: { type: String, required: false },
  songCycleIndex: { type: String, required: false },
  textAndTranslation: { type: String, required: false },
  accompaniments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accompaniment' }],
}, { collection: 'songs' });
// eslint-disable-next-line new-cap
const SongModel = new mongoose.model('Song', songModel);

// atlasPlugin.initialize({
//   model: SongModel,
//   overwriteFind: true,
//   searchKey: 'search',
//   searchFunction: (query) => ({
//     wildcard: {
//       query: `${query}*`,
//       path: 'title',
//       allowAnalyzedField: true,
//     },
//   }),
// });
//
// (async () => {
//   const resultWithSearch = await SongModel.find({search: 'test user'}); //aggregation is used
//   const resultWithoutSearch = await SongModel.find({name: 'test user'}); //standard "find" is used
// })();

export default SongModel;
