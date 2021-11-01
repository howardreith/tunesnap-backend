import jwt from 'jsonwebtoken';
import { generateToken } from './authHelpers';

describe('authHelpers', () => {
  describe('generateToken', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'soSecret';
    });
    it('should generate a jwt', () => {
      const result = generateToken('aHappyUserId23');
      const decoded = jwt.decode(result);
      expect(decoded).toBeTruthy();
      expect(decoded.id).toEqual('aHappyUserId23');
      expect(decoded.exp).toBeTruthy();
      expect(decoded.iat).toBeTruthy();
    });
  });
});
