import implementControllers from './implementControllers';

describe('implementControllers', () => {
  it('should implement all the controllers', () => {
    const app = { post: jest.fn(), get: jest.fn() };
    implementControllers(app);
    expect(app.post).toHaveBeenCalledTimes(5);
    expect(app.get).toHaveBeenCalledTimes(2);
  });
});