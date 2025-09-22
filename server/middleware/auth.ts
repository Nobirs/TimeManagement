import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken } from "../lib/jwt";
import { logger } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

export const auth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(
    `[AUTH] middleware: ${(req.headers.authorization, req.originalUrl)}`
  );
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    logger.info(
      `[AUTH] middleware: Unauthorized ${
        (req.headers.authorization, req.originalUrl)
      }`
    );
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    logger.info(
      `[AUTH] middleware: Authorized ${
        (req.headers.authorization, req.originalUrl)
      }`
    );
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
