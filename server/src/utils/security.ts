import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { config } from "../config.js";
import type { User } from "../entities/User.js";

// Password hashing settings
const SALT_ROUNDS = 12;

// JWT payload shapes
export type AuthTokenPayload = JwtPayload & {
  sub: string;
  role: User["role"];
  email: string;
};

// Password helpers
export const hashPassword = (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

// JWT helpers
export const signToken = (user: User) => {
  const payload: AuthTokenPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
  };

  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

export const verifyToken = (token: string) => {
  const payload = jwt.verify(token, config.jwt.secret);

  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return payload as AuthTokenPayload;
};
