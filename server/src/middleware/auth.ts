import type { RequestHandler } from "express";

import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { UserStatus } from "../entities/enums.js";
import { verifyToken } from "../utils/security.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatus.Active) {
      return res.status(401).json({
        message: "Authentication token is invalid",
      });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({
      message: "Authentication token is invalid",
    });
  }
};