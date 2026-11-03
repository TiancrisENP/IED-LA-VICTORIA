"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowDownZA,
  ArrowUp,
  ArrowUpAZ,
  ArrowUpZA,
  Check,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface FilterOption {
  label: string;
  value: string;
}

export interface ColumnHeaderFilterProps {
  title: string;
  className?: string;
  // Sorting props
  sort?: "asc" | "desc" | null;
  onSortChange?: (sort: "asc" | "desc" | null) => void;
  sortType?: "alpha" | "numeric";
  // Filtering props
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterType?: "text" | "select";
  options?: FilterOption[];
  placeholder?: string;
  align?: "start" | "end";
}

export function ColumnHeaderFilter({
  title,
  className,
  sort,
  onSortChange,
  sortType = "alpha",
  filterValue = "",
  onFilterChange,
  filterType = "text",
  options,
  placeholder,
  align = "start",
}: ColumnHeaderFilterProps) {
  const [optionQuery, setOptionQuery] = React.useState("");
  const isSorted = !!sort;
  const isFiltered = !!filterValue && filterValue !== "all";
  const hasActiveState = isSorted || isFiltered;

  // Filter options if list is long
  const filteredOptions = React.useMemo(() => {
    if (!options) return [];
    if (!optionQuery.trim()) return options;
    const q = optionQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, optionQuery]);

  const handleClear = () => {
    if (onSortChange) onSortChange(null);
    if (onFilterChange) onFilterChange(filterType === "select" ? "all" : "");
    setOptionQuery("");
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5 font-medium select-none", className)}>
      <span>{title}</span>
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-md border text-xs transition-all outline-none focus-visible:ring-1 focus-visible:ring-brand-navy cursor-pointer",
                hasActiveState
                  ? "border-brand-navy bg-brand-navy text-white shadow-xs"
                  : "border-transparent text-muted-foreground/70 hover:border-border hover:bg-muted/80 hover:text-foreground"
              )}
              title={`Filtrar u ordenar por ${title}`}
            />
          }
        >
          {sort === "asc" ? (
            <ArrowUp className="size-3 stroke-[2.5]" />
          ) : sort === "desc" ? (
            <ArrowDown className="size-3 stroke-[2.5]" />
          ) : (
            <Filter className={cn("size-3", hasActiveState ? "fill-white/20" : "")} />
          )}
          <span className="sr-only">Filtrar columna {title}</span>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          sideOffset={6}
          className="w-64 space-y-3 p-3 text-xs"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Filter className="size-3.5 text-brand-navy" />
              <span>{title}</span>
            </div>
            {hasActiveState && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-[11px] font-medium text-destructive transition-colors hover:text-destructive/80 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                Limpiar
              </button>
            )}
          </div>

          {/* Sort Controls */}
          {onSortChange && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Ordenar
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  variant={sort === "asc" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs font-normal justify-start px-2",
                    sort === "asc" && "bg-brand-navy text-white hover:bg-brand-navy/90"
                  )}
                  onClick={() => onSortChange(sort === "asc" ? null : "asc")}
                >
                  {sortType === "alpha" ? (
                    <ArrowUpAZ className="size-3.5 mr-1" />
                  ) : (
                    <ArrowUp className="size-3.5 mr-1" />
                  )}
                  {sortType === "alpha" ? "A → Z" : "Ascendente"}
                </Button>
                <Button
                  type="button"
                  variant={sort === "desc" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs font-normal justify-start px-2",
                    sort === "desc" && "bg-brand-navy text-white hover:bg-brand-navy/90"
                  )}
                  onClick={() => onSortChange(sort === "desc" ? null : "desc")}
                >
                  {sortType === "alpha" ? (
                    <ArrowDownZA className="size-3.5 mr-1" />
                  ) : (
                    <ArrowDown className="size-3.5 mr-1" />
                  )}
                  {sortType === "alpha" ? "Z → A" : "Descendente"}
                </Button>
              </div>
            </div>
          )}

          {/* Filter Controls */}
          {onFilterChange && (
            <div className="space-y-1.5 border-t pt-2">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Filtrar
              </p>

              {filterType === "text" ? (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3 text-muted-foreground" />
                  <Input
                    value={filterValue}
                    placeholder={placeholder ?? `Buscar ${title.toLowerCase()}...`}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="h-8 pl-7 text-xs"
                  />
                  {filterValue && (
                    <button
                      type="button"
                      onClick={() => onFilterChange("")}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              ) : options ? (
                <div className="space-y-1.5">
                  {options.length > 5 && (
                    <div className="relative mb-1">
                      <Search className="absolute left-2 top-2 size-3 text-muted-foreground" />
                      <Input
                        value={optionQuery}
                        placeholder="Buscar en lista..."
                        onChange={(e) => setOptionQuery(e.target.value)}
                        className="h-7 pl-6 text-[11px]"
                      />
                    </div>
                  )}
                  <div className="max-h-36 overflow-y-auto space-y-0.5 pr-0.5">
                    <button
                      type="button"
                      onClick={() => onFilterChange("all")}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs transition-colors cursor-pointer",
                        !filterValue || filterValue === "all"
                          ? "bg-brand-navy/10 font-semibold text-brand-navy"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>Todos</span>
                      {(!filterValue || filterValue === "all") && (
                        <Check className="size-3" />
                      )}
                    </button>
                    {filteredOptions.map((opt) => {
                      const selected = filterValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onFilterChange(selected ? "all" : opt.value)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs transition-colors cursor-pointer",
                            selected
                              ? "bg-brand-navy/10 font-semibold text-brand-navy"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <span className="truncate">{opt.label}</span>
                          {selected && <Check className="size-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
