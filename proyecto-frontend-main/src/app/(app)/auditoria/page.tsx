"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { ColumnHeaderFilter } from "@/components/shared/column-header-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar, paginate } from "@/components/shared/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, fullName } from "@/lib/format";
import { personById } from "@/lib/lookups";
import { useAppData } from "@/providers/data-provider";

export default function AuditPage() {
  const { audit, people } = useAppData();
  const actions = useMemo(
    () => Array.from(new Set(audit.map((record) => record.action))),
    [audit]
  );

  // Column header filter & sorting states
  const [dateSort, setDateSort] = useState<"asc" | "desc" | null>("desc");
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const hasActiveFilters =
    dateSort !== "desc" ||
    !!userFilter.trim() ||
    actionFilter !== "all" ||
    !!entityFilter.trim() ||
    !!from ||
    !!to;

  const clearAllFilters = () => {
    setDateSort("desc");
    setUserFilter("");
    setActionFilter("all");
    setEntityFilter("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const uf = userFilter.trim().toLowerCase();
    const ef = entityFilter.trim().toLowerCase();

    const list = audit.filter((record) => {
      const actor = personById(people, record.userId);
      const actorName = actor ? fullName(actor).toLowerCase() : "sistema";

      const matchesAction = actionFilter === "all" || record.action === actionFilter;
      const matchesUser = !uf || actorName.includes(uf);
      const matchesEntity =
        !ef ||
        record.entity.toLowerCase().includes(ef) ||
        record.entityId.toLowerCase().includes(ef);

      const date = record.date.slice(0, 10);
      const matchesFrom = !from || date >= from;
      const matchesTo = !to || date <= to;

      return matchesAction && matchesUser && matchesEntity && matchesFrom && matchesTo;
    });

    if (dateSort) {
      list.sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        return dateSort === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [actionFilter, audit, dateSort, entityFilter, from, people, to, userFilter]);

  const { rows, pageCount, total } = paginate(filtered, page, 10);

  return (
    <div>
      <PageHeader
        title="Bitácora de auditoría"
        description="Registro de acciones sobre usuarios, matrículas y estructura académica. Ordene y filtre desde las cabeceras de la tabla."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Auditoría" }]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="space-y-1">
              <Label className="text-xs">Rango de fechas: Desde</Label>
              <Input
                type="date"
                value={from}
                className="h-8 text-xs"
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input
                type="date"
                value={to}
                className="h-8 text-xs"
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={clearAllFilters}
              >
                <RotateCcw className="size-3" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title="Sin registros"
              description="No hay eventos en el rango o con los filtros seleccionados."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Fecha"
                        sort={dateSort}
                        onSortChange={(s) => {
                          setDateSort(s);
                          setPage(1);
                        }}
                        sortType="numeric"
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Usuario"
                        filterValue={userFilter}
                        onFilterChange={(v) => {
                          setUserFilter(v);
                          setPage(1);
                        }}
                        placeholder="Buscar usuario..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Acción"
                        filterValue={actionFilter}
                        onFilterChange={(v) => {
                          setActionFilter(v);
                          setPage(1);
                        }}
                        filterType="select"
                        options={actions.map((act) => ({ label: act, value: act }))}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Entidad"
                        filterValue={entityFilter}
                        onFilterChange={(v) => {
                          setEntityFilter(v);
                          setPage(1);
                        }}
                        placeholder="Buscar entidad..."
                      />
                    </TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((record) => {
                    const actor = personById(people, record.userId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="tabular text-muted-foreground">
                          {formatDateTime(record.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {actor ? fullName(actor) : "Sistema"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal text-xs">
                            {record.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{record.entity}</span>
                          <span className="block text-xs text-muted-foreground">
                            {record.entityId}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{record.ip}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <PaginationBar
                page={page}
                pageCount={pageCount}
                total={total}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
