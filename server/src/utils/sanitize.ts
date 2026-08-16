import type { Category } from "../entities/Category.js";
import type { Opportunity } from "../entities/Opportunity.js";
import type { User } from "../entities/User.js";

// Public response shapes
export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  role: User["role"];
  status: User["status"];
  createdAt: Date;
  updatedAt: Date;
};

export type PublicCategory = {
  id: string;
  name: string;
};

export type PublicOpportunity = {
  id: string;
  title: string;
  description: string;
  type: Opportunity["type"];
  capacity: number;
  deadline: Date;
  startDate: Date | null;
  imageUrl: string | null;
  attachmentUrl: string | null;
  status: Opportunity["status"];
  owner: PublicUser;
  category: PublicCategory | null;
  createdAt: Date;
  updatedAt: Date;
};

// Entity sanitizers
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

export const toPublicCategory = (category: Category): PublicCategory => {
  return {
    id: category.id,
    name: category.name,
  };
};

export const toPublicOpportunity = (
  opportunity: Opportunity
): PublicOpportunity => {
  return {
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    type: opportunity.type,
    capacity: opportunity.capacity,
    deadline: opportunity.deadline,
    startDate: opportunity.startDate,
    imageUrl: opportunity.imageUrl,
    attachmentUrl: opportunity.attachmentUrl,
    status: opportunity.status,
    owner: toPublicUser(opportunity.owner),
    category: opportunity.category
      ? toPublicCategory(opportunity.category)
      : null,
    createdAt: opportunity.createdAt,
    updatedAt: opportunity.updatedAt,
  };
};
