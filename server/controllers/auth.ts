import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../services/prisma";
import { generateToken, verifyToken } from "../lib/jwt";
import { registerSchema, loginSchema } from "../auth.schema";
import { logger } from "../utils/logger";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = registerSchema.parse(req.body.data);
  logger.info(email, password, name);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400).json({ error: "User already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const token = generateToken(user);
  res.status(201).json({ user, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body.data);
  logger.info(email, password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user);
  res.json({ data: { user, token } });
};

export const fastLogin = async (req: Request, res: Response) => {
  const {
    data: { token },
  } = req.body;
  logger.info(token);
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    res.json({ data: { user, token } });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
