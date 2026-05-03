export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number | null;
  hasMore: boolean;
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export function clampPagination(input: PaginationInput): { page: number; pageSize: number; from: number; to: number } {
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(input.pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export function paginationMeta(
  page: number,
  pageSize: number,
  total: number | null,
  rowCount: number,
): PaginationMeta {
  const hasMore = total != null ? page * pageSize < total : rowCount === pageSize;
  return { page, pageSize, total, hasMore };
}
