import SongModel from '../models/songModel.js';
import {
  getAndSortSongsAccordingToParam,
  getSongsWithRequestsOptionallySortedByMostRecentAccompanimentRequest, refreshCache,
} from '../utils/songHelpers.js';
import UserModel from '../models/userModel.js';

export async function createSong(song) {
  const songData = { ...song };
  if (!Array.isArray(songData.accompaniments)) {
    songData.accompaniments = [];
  }
  const newSong = new SongModel(song);
  return newSong.save();
}

export async function getSongAtId(id) {
  const song = await SongModel.findById(id);
  return song.populate('accompaniments');
}

export async function getAllSongs(filter = {}, limit = 10) {
  return SongModel.find(filter).limit(limit);
}

export async function getSongViaAutocomplete({
  titleSearchValue, composerSearchValue, songSetSearchValue, sortBy, page,
}, clearCache = false) {
  const trueTitleSearchValue = titleSearchValue || '';
  const trueComposerSearchValue = composerSearchValue || '';
  const trueSongSetSearchValue = songSetSearchValue || '';
  const songs = await getAndSortSongsAccordingToParam(sortBy, clearCache);
  const songIndexes = [];
  for (let i = 0; i < songs.length; i += 1) {
    if ((songs[i].title.toLowerCase().includes(trueTitleSearchValue.toLowerCase())
      || songs[i].title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .includes(trueTitleSearchValue.toLowerCase()))
      && (songs[i].composer.toLowerCase().includes(trueComposerSearchValue.toLowerCase())
        || songs[i].composer.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
          .includes(trueComposerSearchValue.toLowerCase()))
      && (trueSongSetSearchValue ? ((songs[i].songCycle
        && songs[i].songCycle.toLowerCase().includes(trueSongSetSearchValue.toLowerCase()))
        || (songs[i].songCycle
          && songs[i].songCycle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            .includes(trueSongSetSearchValue.toLowerCase()))) : true)) {
      songIndexes.push(i);
    }
  }
  const matchesArray = [];
  for (let i = 0; i < songIndexes.length; i += 1) {
    matchesArray.push(songs[songIndexes[i]]);
  }
  const start = page * 10;
  const end = (page + 1) * 10;
  const pageOfMatches = matchesArray.slice(start, end);
  return { songs: pageOfMatches, numberOfSongs: matchesArray.length };
}

export async function addAccompanimentRequestForSong(songData, userId) {
  const { id: songId } = songData;

  const song = await SongModel.findById(songId);
  const user = await UserModel.findById(userId);

  const accompanimentRequests = [...song.accompanimentRequests];
  const requestedAccompaniments = [...user.requestedAccompaniments];
  accompanimentRequests.push({ userId: user.id, dateCreated: new Date() });
  requestedAccompaniments.push({ songId: song.id, dateCreated: new Date() });

  await SongModel.findByIdAndUpdate(
    song.id,
    { accompanimentRequests },
  );
  await UserModel.findByIdAndUpdate(
    user.id,
    { requestedAccompaniments },
  );
  return (await UserModel.findById(user.id)).requestedAccompaniments;
}

export async function deleteAccompanimentRequestForSong(songData, userId) {
  const { id: songId } = songData;
  const song = await SongModel.findById(songId);
  const user = await UserModel.findById(userId);

  const accompanimentRequests = [...song.accompanimentRequests];
  const requestedAccompaniments = [...user.requestedAccompaniments];

  const accompanimentRequestIndex = accompanimentRequests
    .findIndex((acc) => acc.userId.toString() === user.id.toString());
  accompanimentRequests.splice(accompanimentRequestIndex, 1);

  const requestedAccompanimentIndex = requestedAccompaniments
    .findIndex((acc) => acc.songId.toString() === song.id.toString());
  requestedAccompaniments.splice(requestedAccompanimentIndex, 1); // 2nd p

  await SongModel.findByIdAndUpdate(
    song.id,
    { accompanimentRequests },
  );
  await UserModel.findByIdAndUpdate(
    user.id,
    { requestedAccompaniments },
  );

  return (await UserModel.findById(user.id)).requestedAccompaniments;
}

// Add functionality for sorting by most recently requested
export async function getSongsSortedByNumberOfRequests(pageNumberObj = { page: 1 }, sortByRecency = false) {
  const songsWithAccompanimentRequests = await getSongsWithRequestsOptionallySortedByMostRecentAccompanimentRequest(sortByRecency);
  const pageNumber = Number(pageNumberObj.page);
  const bottomOfRange = (pageNumber - 1) * 10;
  const topOfRange = pageNumber * 10;
  return {
    accompanimentRequestsPage: songsWithAccompanimentRequests
      .slice(bottomOfRange, topOfRange),
    totalLength: songsWithAccompanimentRequests.length,
  };
}

export default {
  createSong,
  getAllSongs,
  getSongAtId,
  getSongViaAutocomplete,
  addAccompanimentRequestForSong,
  deleteAccompanimentRequestForSong,
};
