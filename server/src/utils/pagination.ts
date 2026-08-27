import { z } from "zod";

const defaultPage = 1;
const defaultLimit = 10;
const maxLimit = 50;

export type PaginationOptions = {
  defaultLimit?: number;
  defaultPage?: number;
  maxLimit?: number;
};

export type PaginationParams = {
  limit: number;
  page: number;
  skip: number;
  take: number;
};

export type PaginationMeta = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export const createPaginationQuerySchema = (
  options: PaginationOptions = {}
) => {
  const pageDefault = options.defaultPage ?? defaultPage;
  const limitDefault = options.defaultLimit ?? defaultLimit;
  const limitMax = options.maxLimit ?? maxLimit;

  return z.object({
    page: z.coerce.number().int().min(1).default(pageDefault),
    limit: z.coerce.number().int().min(1).max(limitMax).default(limitDefault),
  });
};

export const getPaginationParams = (
  page: number,
  limit: number
): PaginationParams => ({
  page,
  limit,
  skip: (page - 1) * limit,
  take: limit,
});

export const createPaginationMeta = (
  total: number,
  params: Pick<PaginationParams, "limit" | "page">
): PaginationMeta => {
  const totalPages = Math.ceil(total / params.limit);

  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
};
