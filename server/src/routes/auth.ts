import { Router } from "express";
import { z } from "zod";

import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { UserRole } from "../entities/enums.js";
import {
  authenticate,
  authorize,
  requireAuth,
  rolePermissions,
} from "../middleware/auth.js";
import { hashPassword, signToken, verifyPassword } from "../utils/security.js";
import { toPublicUser } from "../utils/sanitize.js";

export const authRouter = Router();

const registerSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum([UserRole.Student, UserRole.Mentor]),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

authRouter.post("/api/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid registration data",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const email = parsed.data.email.toLowerCase();

  const existingUser = await userRepository.findOne({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email is already registered",
    });
  }

  const user = userRepository.create({
    fullName: parsed.data.fullName,
    email,
    passwordHash: await hashPassword(parsed.data.password),
    role: parsed.data.role,
  });

  const savedUser = await userRepository.save(user);
  const token = signToken(savedUser);

  return res.status(201).json({
    token,
    user: toPublicUser(savedUser),
  });
});

authRouter.post("/api/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid login data",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const email = parsed.data.email.toLowerCase();

  const user = await userRepository.findOne({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await verifyPassword(
    parsed.data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const token = signToken(user);

  return res.json({
    token,
    user: toPublicUser(user),
  });
});

authRouter.get("/api/auth/me", requireAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  return res.json({
    user: toPublicUser(req.user),
  });
});

authRouter.get(
  "/api/auth/admin-check",
  authenticate,
  authorize(...rolePermissions.adminOnly),
  (_req, res) => {
    return res.json({
      message: "Allowed",
    });
  }
);
