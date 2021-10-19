export default {
  preset: '@shelf/jest-mongodb',
  transform: {
    '\\.m?jsx?$': 'jest-esm-transformer',
  },
};
