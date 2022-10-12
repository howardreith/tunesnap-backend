import schedule from 'node-schedule';
import SongModel from '../models/songModel.js';

let songs = [];
const sortedSongArrays = {
  songsSortedByTitle: [],
  songsSortedByTitleReverse: [],
  songsSortedByComposer: [],
  songsSortedByComposerReverse: [],
  songsSortedBySongCycle: [],
  songsSortedBySongCycleReverse: [],
};

export function clearCache() {
  songs = [];
  Object.keys(sortedSongArrays).forEach((key) => {
    sortedSongArrays[key] = [];
  });
}

export async function refreshCache() {
  songs = await SongModel.find({});
  sortedSongArrays.songsSortedByComposerReverse = [...songs].sort((a, b) => {
    const aNameSplit = a.composer.split(' ');
    const bNameSplit = b.composer.split(' ');
    const aLastName = aNameSplit[aNameSplit.length - 1];
    const bLastName = bNameSplit[bNameSplit.length - 1];
    if (aLastName < bLastName) { return 1; }
    if (aLastName > bLastName) { return -1; }
    return 0;
  });
  sortedSongArrays.songsSortedByComposer = [...songs].sort((a, b) => {
    const aNameSplit = a.composer.split(' ');
    const bNameSplit = b.composer.split(' ');
    const aLastName = aNameSplit[aNameSplit.length - 1];
    const bLastName = bNameSplit[bNameSplit.length - 1];
    if (aLastName < bLastName) { return -1; }
    if (aLastName > bLastName) { return 1; }
    return 0;
  });
  sortedSongArrays.songsSortedBySongCycleReverse = [...songs].sort((a, b) => {
    if (!a.songCycle || a.songCycle < b.songCycle) { return 1; }
    if (!b.songCycle || a.songCycle > b.songCycle) { return -1; }
    return 0;
  });
  sortedSongArrays.songsSortedBySongCycle = [...songs].sort((a, b) => {
    if (!a.songCycle || a.songCycle < b.songCycle) { return -1; }
    if (!b.songCycle || a.songCycle > b.songCycle) { return 1; }
    return 0;
  });
  sortedSongArrays.songsSortedByTitleReverse = [...songs].sort((a, b) => {
    if (a.title < b.title) { return 1; }
    if (a.title > b.title) { return -1; }
    return 0;
  });
  sortedSongArrays.songsSortedByTitle = [...songs].sort((a, b) => {
    if (a.title < b.title) { return -1; }
    if (a.title > b.title) { return 1; }
    return 0;
  });
  // eslint-disable-next-line no-console
  console.info('Songs cache has been updated');
}

schedule.scheduleJob('*/30 * * * *', async () => {
  await refreshCache();
});

export const SORT_OPTIONS = {
  TITLE: 'title',
  TITLE_REVERSE: 'titleReverse',
  COMPOSER: 'composer',
  COMPOSER_REVERSE: 'composerReverse',
  SONG_CYCLE: 'songCycle',
  SONG_CYCLE_REVERSE: 'songCycleReverse',
};

export async function getAndSortSongsAccordingToParam(sortBy, clearTheCache) {
  if (clearTheCache) {
    clearCache();
  }
  if (!songs || songs.length === 0) {
    await refreshCache();
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

export async function getSongsWithRequestsOptionallySortedByMostRecentAccompanimentRequest(sort = false) {
  if (!songs || songs.length === 0) {
    await refreshCache();
  }
  const songsWithRequests = songs.filter((song) => song.accompanimentRequests
    && song.accompanimentRequests.length > 0);
  if (!sort) {
    return songsWithRequests
      .sort((a, b) => b.accompanimentRequests.length - a.accompanimentRequests.length);
  }
  return songsWithRequests.sort((a, b) => new Date(
    b.accompanimentRequests
      .sort((c, d) => new Date(new Date(d.dateCreated) - new Date(c.dateCreated)))[0]
      .dateCreated,
  )
    - new Date(
      a.accompanimentRequests
        .sort((c, d) => new Date(new Date(d.dateCreated) - new Date(c.dateCreated)))[0]
        .dateCreated,
    ));
}
