import React, { useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DataListPagination } from "@/components/ui/data-list-pagination";
import { useDataList } from "@/hooks/useDataList";
import { DataListProps } from "@/types/dataList";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";

export function DataList<T>({
  title,
  description,
  fetchData,
  renderItem,
  pagination,
  pageSize = 10,
  height = "400px",
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  className,
  loading: externalLoading,
  onItemSelect,
  gridLayout = "1-column",
}: DataListProps<T>) {
  const {
    data,
    loading: internalLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    totalCount,
    loadNextPage,
    loadPrevPage,
    goToPage,
    refresh,
  } = useDataList(fetchData, pageSize, pagination);

  const loading = externalLoading ?? internalLoading;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Scroll infinito
  const handleScroll = useCallback(() => {
    if (pagination !== "infinite" || loading || !hasNextPage) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom) {
      loadNextPage();
    }
  }, [pagination, loading, hasNextPage, loadNextPage]);

  // Configurar scroll infinito
  useEffect(() => {
    if (pagination !== "infinite") return;

    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll, pagination]);

  // Configurar Intersection Observer para scroll infinito mais eficiente
  useEffect(() => {
    if (pagination !== "infinite" || !loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !loading) {
          loadNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);

    return () => observer.disconnect();
  }, [pagination, hasNextPage, loading, loadNextPage]);

  const handleItemClick = (item: T) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  const getGridClasses = () => {
    switch (gridLayout) {
      case "2-columns":
        return "grid grid-cols-1 md:grid-cols-2 gap-4";
      case "3-columns":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
      case "4-columns":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
      default:
        return "space-y-2";
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <EmptyState
          title="Erro ao carregar dados"
          description={error}
          action={
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          }
        />
      );
    }

    if (data.length === 0 && !loading) {
      return (
        <EmptyState
          icon={emptyStateIcon}
          title={emptyStateTitle}
          description={emptyStateDescription}
          action={emptyStateAction}
        />
      );
    }

    return (
      <>
        <div className={getGridClasses()}>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleItemClick(item)}
              className={cn(
                onItemSelect &&
                  "cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
              )}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>

        {/* Loading indicator para scroll infinito */}
        {pagination === "infinite" && hasNextPage && (
          <div ref={loadingRef} className="flex justify-center py-4">
            {loading && <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
        )}
      </>
    );
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      {(title || description) && (
        <CardHeader className="flex-shrink-0">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Container com altura fixa */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          style={{
            height,
            minHeight: height,
            maxHeight: height,
          }}
        >
          {loading && data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Carregando...
                </span>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>

        {/* Paginação por botões */}
        {pagination === "paged" && totalPages > 1 && (
          <div className="flex-shrink-0 pt-4 border-t">
            <DataListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              loading={loading}
              totalCount={totalCount}
              pageSize={pageSize}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
