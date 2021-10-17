import mongoClient from '../repository/MongoClient.js';

export default async function createSong(song) {
  console.log('===> mongoClient', mongoClient);
  return song;
}
