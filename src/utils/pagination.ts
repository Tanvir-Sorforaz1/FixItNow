export type PaginationQuery = {
  page?: string;
  limit?: string;
};

export const getPagination = (query: PaginationQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
