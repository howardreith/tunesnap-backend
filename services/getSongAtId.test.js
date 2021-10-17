import getSongAtId from './getSongAtId.js';

describe('getSongAtId', () => {
  it('returns a song object at the given ID', async () => {
    const result = await getSongAtId(1);
    console.log('===> result', result);
    expect(true).toBe(false);
  });
});
