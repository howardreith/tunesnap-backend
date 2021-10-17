import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017/tunesnap';

// Create a new MongoClient
const client = new MongoClient(uri);
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db('admin').command({ ping: 1 });
    // eslint-disable-next-line no-console
    console.log('Connected successfully to Mongo server');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('An error occurred starting MongoDB: ', e);
});

export default client;
