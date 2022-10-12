import mongoose from 'mongoose';

export async function connectToInMemoryDb() {
  await mongoose.connect(global.__MONGO_URI__, { }, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    }
  });
}

export async function disconnectFromInMemoryDb() {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
}

export async function clearDatabase() {
  const collections = await mongoose.connection.db.collections();
  collections?.map((conn) => {
    conn.deleteMany({});
    return null;
  });
}
