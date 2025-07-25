import { ReactNode } from "react";

export interface PaginatedData<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DataListProps<T> {
  title?: string;
  description?: string;
  fetchData: (page: number, pageSize: number) => Promise<PaginatedData<T>>;
  renderItem: (item: T) => ReactNode;
  pagination: "paged" | "infinite";
  pageSize?: number;
  height?: string;
  emptyStateIcon?: ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: ReactNode;
  className?: string;
  loading?: boolean;
  onItemSelect?: (item: T) => void;
  gridLayout?: "1-column" | "2-columns" | "3-columns" | "4-columns";
}

export interface UseDataListReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
  loadNextPage: () => Promise<void>;
  loadPrevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
}
