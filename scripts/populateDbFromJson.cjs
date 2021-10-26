const fs = require('fs');
const { createSong } = require('../services/songService');

function populateDbFromJson() {
  fs.readFile('../mockData.json', 'utf-8', (err, jsonString) => {
    const data = JSON.parse(jsonString);
    data.forEach((datum) => {
      datum.songs.forEach((song) => {
        createSong(song);
      });
    });
  });
}

populateDbFromJson();
