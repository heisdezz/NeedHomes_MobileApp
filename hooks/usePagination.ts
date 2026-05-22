import { useState, useCallback } from "react";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  limit?: number;
}

export function usePagination({ initialPage = 1, limit = 10 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const totalPages = meta?.totalPages ?? 1;

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const reset = useCallback(() => setPage(1), []);

  return {
    page,
    limit,
    meta,
    setMeta,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
}
