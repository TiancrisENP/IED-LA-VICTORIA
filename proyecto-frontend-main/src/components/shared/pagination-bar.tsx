import { Button } from "@/components/ui/button";

export function PaginationBar({
  page,
  pageCount,
  onPageChange,
  total,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total: number;
}) {
  const safePage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 border-t px-1 pt-3 sm:flex-row sm:items-center">
      <p className="text-center text-xs text-muted-foreground sm:text-left">
        {total} registro{total === 1 ? "" : "s"} · página{" "}
        <span className="tabular">{safePage}</span> de{" "}
        <span className="tabular">{pageCount}</span>
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          variant="outline"
          className="h-9"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          className="h-9"
          disabled={safePage >= pageCount}
          onClick={() => onPageChange(safePage + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

export function paginate<T>(items: T[], page: number, pageSize = 8) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total: items.length,
  };
}
