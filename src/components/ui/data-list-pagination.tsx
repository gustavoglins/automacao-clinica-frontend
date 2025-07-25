import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataListPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading?: boolean;
  showPageInfo?: boolean;
  totalCount?: number;
  pageSize?: number;
}

export const DataListPagination: React.FC<DataListPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  loading = false,
  showPageInfo = true,
  totalCount,
  pageSize,
}) => {
  // Gerar lista de páginas para mostrar
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Se há poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra a primeira página
      pages.push(1);

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adiciona ... se necessário
      if (startPage > 2) {
        pages.push("...");
      }

      // Adiciona páginas ao redor da atual
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Adiciona ... se necessário
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Sempre mostra a última página
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4">
      {/* Info sobre paginação */}
      {showPageInfo && totalCount && pageSize && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
          {Math.min(currentPage * pageSize, totalCount)} de {totalCount} itens
        </div>
      )}

      {/* Controles de paginação */}
      <div className="flex items-center justify-center gap-2">
        {/* Botão anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <div className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  className={cn(
                    "h-8 w-8 p-0",
                    page === currentPage && "bg-primary text-primary-foreground"
                  )}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botão próximo */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima página</span>
        </Button>
      </div>
    </div>
  );
};
