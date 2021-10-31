import SongModel from '../models/songModel.js';
import { getAndSortSongsAccordingToParam } from '../utils/songHelpers.js';

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
  const songs = await getAndSortSongsAccordingToParam(sortBy, clearCache);
  const songIndexes = [];
  for (let i = 0; i < songs.length; i += 1) {
    if ((songs[i].title.toLowerCase().includes(titleSearchValue.toLowerCase())
      || songs[i].title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .includes(titleSearchValue.toLowerCase()))
      && (songs[i].composer.toLowerCase().includes(composerSearchValue.toLowerCase())
        || songs[i].composer.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
          .includes(composerSearchValue.toLowerCase()))
      && (songSetSearchValue ? ((songs[i].songCycle
        && songs[i].songCycle.toLowerCase().includes(songSetSearchValue.toLowerCase()))
        || (songs[i].songCycle
          && songs[i].songCycle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            .includes(songSetSearchValue.toLowerCase()))) : true)) {
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

export default {
  createSong,
  getAllSongs,
  getSongAtId,
  getSongViaAutocomplete,
};
