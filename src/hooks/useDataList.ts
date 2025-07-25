import { useState, useEffect, useCallback } from "react";
import { PaginatedData, UseDataListReturn } from "@/types/dataList";

export function useDataList<T>(
  fetchData: (page: number, pageSize: number) => Promise<PaginatedData<T>>,
  pageSize = 10,
  paginationType: "paged" | "infinite" = "paged"
): UseDataListReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const loadData = useCallback(async (page: number, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchData(page, pageSize);
      
      if (append && paginationType === "infinite") {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setHasPrevPage(result.hasPrevPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, pageSize, paginationType]);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || loading) return;
    
    const nextPage = currentPage + 1;
    await loadData(nextPage, paginationType === "infinite");
  }, [hasNextPage, loading, currentPage, loadData, paginationType]);

  const loadPrevPage = useCallback(async () => {
    if (!hasPrevPage || loading || currentPage <= 1) return;
    
    const prevPage = currentPage - 1;
    await loadData(prevPage, false);
  }, [hasPrevPage, loading, currentPage, loadData]);

  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    
    await loadData(page, false);
  }, [totalPages, loading, loadData]);

  const refresh = useCallback(async () => {
    if (paginationType === "infinite") {
      setCurrentPage(1);
      await loadData(1, false);
    } else {
      await loadData(currentPage, false);
    }
  }, [loadData, currentPage, paginationType]);

  // Carregar dados iniciais
  useEffect(() => {
    loadData(1, false);
  }, [loadData]);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    totalCount,
    loadNextPage,
    loadPrevPage,
    goToPage,
    refresh
  };
}
