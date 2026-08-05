import { Router } from "express";
import { z } from "zod";

import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { UserRole } from "../entities/enums.js";
import { hashPassword, signToken } from "../utils/security.js";
import { toPublicUser } from "../utils/sanitize.js";

export const authRouter = Router();

const registerSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum([UserRole.Student, UserRole.Mentor]),
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