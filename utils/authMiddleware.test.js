import jwt from 'jsonwebtoken';
import protectEndpoint from './authMiddleware';

describe('authMiddleware', () => {
  describe('protectEndpoint', () => {
    let next;
    let defaultRequest;
    let defaultToken;
    let id;

    beforeEach(() => {
      process.env.JWT_SECRET = 'superSecret';
      next = jest.fn();
      id = 'aFakeUserId';
      defaultToken = jwt.sign({ id }, process.env.JWT_SECRET);
      defaultRequest = {
        headers: {
          authorization: `Bearer ${defaultToken}`,
        },
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should respond with a 401 if there is no authorization header', () => {
      global.console.error = jest.fn();
      const req = { headers: {} };
      const sendMock = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ send: sendMock }) };
      protectEndpoint(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ status: 'Unauthorized', data: 'No token included in request' });
    });

    it('should respond with a 401 if the token is invalid', () => {
      global.console.error = jest.fn();
      const badToken = jwt.sign({ id }, 'anincorrectSecret');
      const req = { headers: { authorization: `Bearer ${badToken}` } };
      const sendMock = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ send: sendMock }) };
      protectEndpoint(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith({ status: 'Unauthorized', data: 'Invalid token' });
    });

    it('should call next if the token is verified', () => {
      const sendMock = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ send: sendMock }) };
      protectEndpoint(defaultRequest, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
