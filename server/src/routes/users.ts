import { Router, type Request } from "express";
import { z } from "zod";

import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { UserStatus } from "../entities/enums.js";
import { authenticate, authorize, rolePermissions } from "../middleware/auth.js";
import { toPublicUser } from "../utils/sanitize.js";

export const usersRouter = Router();

// Request validation schemas
const updateUserSchema = z.object({
  status: z.enum([UserStatus.Active, UserStatus.Suspended]),
});

// User management routes
// List all users for admin management.
usersRouter.get(
  "/api/users",
  authenticate,
  authorize(...rolePermissions.adminOnly),
  async (_req, res) => {
    const userRepository = AppDataSource.getRepository(User);

    const users = await userRepository.find({
      order: { createdAt: "DESC" },
    });

    return res.json({
      users: users.map(toPublicUser),
    });
  }
);

// Update a user's account status as an admin.
usersRouter.patch(
  "/api/users/:id",
  authenticate,
  authorize(...rolePermissions.adminOnly),
  async (req: Request<{ id: string }>, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid user data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    if (
      req.user.id === req.params.id &&
      parsed.data.status === UserStatus.Suspended
    ) {
      return res.status(400).json({
        message: "Admins cannot suspend their own account",
      });
    }

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.status = parsed.data.status;

    const savedUser = await userRepository.save(user);

    return res.json({
      user: toPublicUser(savedUser),
    });
  }
);
