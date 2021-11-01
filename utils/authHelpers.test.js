import jwt from 'jsonwebtoken';
import { decodeToken, generateToken } from './authHelpers';

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

  describe('decodeToken', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'soSecret';
    });

    it('should decode the token', () => {
      const token = jwt.sign({ id: 'aUserId' }, process.env.JWT_SECRET, { expiresIn: '60m' });
      const result = decodeToken(token);
      expect(result.id).toEqual('aUserId');
      expect(result.exp).toBeTruthy();
      expect(result.iat).toBeTruthy();
    });
  });
});
