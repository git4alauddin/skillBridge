import type { User } from "../entities/User.js";

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  role: User["role"];
  status: User["status"];
  createdAt: Date;
  updatedAt: Date;
};

export const toPublicUser = (user: User): PublicUser => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};