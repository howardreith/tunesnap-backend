export default {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'jest',
    },
    binary: {
      version: '4.1.3', // Version of MongoDB
      skipMD5: true,
    },
    autoStart: false,
  },
};
