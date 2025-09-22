import * as jwt from "jsonwebtoken";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;

export const generateToken = (user: User): string => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};
