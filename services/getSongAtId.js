import mongoClient from '../repository/MongoClient.js';

export default async function getSongAtId(id) {
  console.log('===> mongoClient', mongoClient);
  return id;
}
