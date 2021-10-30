import schedule from 'node-schedule';
import SongModel from '../models/songModel.js';

let songs = [];
schedule.scheduleJob('0 0 * * *', async () => {
  songs = (await SongModel.find({}));
  // eslint-disable-next-line no-console
  console.info('Songs cache has been updated');
});

const sortedSongArrays = {
  songsSortedByTitle: [],
  songsSortedByTitleReverse: [],
  songsSortedByComposer: [],
  songsSortedByComposerReverse: [],
  songsSortedBySongCycle: [],
  songsSortedBySongCycleReverse: [],
};

export const SORT_OPTIONS = {
  TITLE: 'title',
  TITLE_REVERSE: 'titleReverse',
  COMPOSER: 'composer',
  COMPOSER_REVERSE: 'composerReverse',
  SONG_CYCLE: 'songCycle',
  SONG_CYCLE_REVERSE: 'songCycleReverse',
};

export async function getAndSortSongsAccordingToParam(sortBy, clearCache) {
  if (clearCache) {
    songs = [];
    Object.keys(sortedSongArrays).forEach((key) => {
      sortedSongArrays[key] = [];
    });
  }
  if (!songs || songs.length === 0) {
    songs = await SongModel.find({});
  }
  switch (sortBy) {
    case SORT_OPTIONS.COMPOSER_REVERSE:
      if (!sortedSongArrays.songsSortedByComposerReverse
        || sortedSongArrays.songsSortedByComposerReverse.length === 0) {
        sortedSongArrays.songsSortedByComposerReverse = [...songs].sort((a, b) => {
          const aNameSplit = a.composer.split(' ');
          const bNameSplit = b.composer.split(' ');
          const aLastName = aNameSplit[aNameSplit.length - 1];
          const bLastName = bNameSplit[bNameSplit.length - 1];
          if (aLastName < bLastName) { return 1; }
          if (aLastName > bLastName) { return -1; }
          return 0;
        });
      }
      return sortedSongArrays.songsSortedByComposerReverse;
    case SORT_OPTIONS.COMPOSER:
      if (!sortedSongArrays.songsSortedByComposer
        || sortedSongArrays.songsSortedByComposer.length === 0) {
        sortedSongArrays.songsSortedByComposer = [...songs].sort((a, b) => {
          const aNameSplit = a.composer.split(' ');
          const bNameSplit = b.composer.split(' ');
          const aLastName = aNameSplit[aNameSplit.length - 1];
          const bLastName = bNameSplit[bNameSplit.length - 1];
          if (aLastName < bLastName) { return -1; }
          if (aLastName > bLastName) { return 1; }
          return 0;
        });
      }
      return sortedSongArrays.songsSortedByComposer;
    case SORT_OPTIONS.SONG_CYCLE_REVERSE:
      if (!sortedSongArrays.songsSortedBySongCycleReverse
        || sortedSongArrays.songsSortedBySongCycleReverse.length === 0) {
        sortedSongArrays.songsSortedBySongCycleReverse = [...songs].sort((a, b) => {
          if (!a.songCycle || a.songCycle < b.songCycle) { return 1; }
          if (!b.songCycle || a.songCycle > b.songCycle) { return -1; }
          return 0;
        });
      }
      return sortedSongArrays.songsSortedBySongCycleReverse;
    case SORT_OPTIONS.SONG_CYCLE:
      if (!sortedSongArrays.songsSortedBySongCycle
        || sortedSongArrays.songsSortedBySongCycle.length === 0) {
        sortedSongArrays.songsSortedBySongCycle = [...songs].sort((a, b) => {
          if (!a.songCycle || a.songCycle < b.songCycle) { return -1; }
          if (!b.songCycle || a.songCycle > b.songCycle) { return 1; }
          return 0;
        });
      }
      return sortedSongArrays.songsSortedBySongCycle;
    case SORT_OPTIONS.TITLE_REVERSE:
      if (!sortedSongArrays.songsSortedByTitleReverse
        || sortedSongArrays.songsSortedByTitleReverse.length === 0) {
        sortedSongArrays.songsSortedByTitleReverse = [...songs].sort((a, b) => {
          if (a.title < b.title) { return 1; }
          if (a.title > b.title) { return -1; }
          return 0;
        });
      }
      return sortedSongArrays.songsSortedByTitleReverse;
    case SORT_OPTIONS.TITLE:
    default:
      if (!sortedSongArrays.songsSortedByTitle
        || sortedSongArrays.songsSortedByTitle.length === 0) {
        sortedSongArrays.songsSortedByTitle = [...songs].sort((a, b) => {
          if (a.title < b.title) { return -1; }
          if (a.title > b.title) { return 1; }
          return 0;
        });
      }
      return sortedSongArrays.songsSortedByTitle;
  }
}
