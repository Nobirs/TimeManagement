import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";
import { logger } from "../utils/logger";

export const validate =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug("[VALIDATION OF REQUEST] - " + req.body);
      schema.parse(req.body.data);
      next();
    } catch (error) {
      logger.error("[VALIDATION ERROR]" + error);
      res.status(400).json(error);
    }
  };
