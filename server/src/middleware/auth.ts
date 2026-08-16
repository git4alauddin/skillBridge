import type { NextFunction, Request, RequestHandler, Response } from "express";

import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { UserRole, UserStatus } from "../entities/enums.js";
import { verifyToken } from "../utils/security.js";

// Request typing
// Attach the authenticated database user to Express requests.
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

// Authentication middleware
export const requireAuth: RequestHandler = async (req, res, next) => {
  // Read bearer token from the Authorization header.
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    // Verify JWT and load the active database user.
    const payload = verifyToken(token);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: payload.sub },
    });

    if (user?.status !== UserStatus.Active) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    // Attach user for downstream route handlers and authorization checks.
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }
};

// Route-level alias used by later milestone docs.
export const authenticate = requireAuth;

// Permission groups
export const rolePermissions = {
  adminOnly: [UserRole.Admin],
  mentorOnly: [UserRole.Mentor],
  studentOnly: [UserRole.Student],
  opportunityManagers: [UserRole.Admin, UserRole.Mentor],
  authenticatedUsers: [UserRole.Admin, UserRole.Mentor, UserRole.Student],
} as const;

// Authorization middleware
export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Authorization depends on authentication running first.
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    // Reject authenticated users whose role is not allowed for this route.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    return next();
  };
