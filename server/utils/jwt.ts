import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

interface TokenPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
   if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
  return jwt.sign({ userId } as TokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
     if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};