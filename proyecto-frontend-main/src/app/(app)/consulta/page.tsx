"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { ColumnHeaderFilter } from "@/components/shared/column-header-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDocument, fullName } from "@/lib/format";
import { courseById, personById, yearById } from "@/lib/lookups";
import { useAppData } from "@/providers/data-provider";

export default function CounselingPage() {
  const data = useAppData();

  const [studentSort, setStudentSort] = useState<"asc" | "desc" | null>(null);
  const [studentFilter, setStudentFilter] = useState("");
  const [docFilter, setDocFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const hasActiveFilters =
    studentSort !== null ||
    !!studentFilter.trim() ||
    !!docFilter.trim() ||
    courseFilter !== "all";

  const clearAllFilters = () => {
    setStudentSort(null);
    setStudentFilter("");
    setDocFilter("");
    setCourseFilter("all");
  };

  const rows = useMemo(() => {
    const sf = studentFilter.trim().toLowerCase();
    const df = docFilter.trim().toLowerCase();

    const list = data.students
      .map((student) => {
        const enrollment = data.enrollments.find((item) => item.studentId === student.id);
        const term = data.courseTerms.find((item) => item.id === enrollment?.courseTermId);
        const guardians = data.links
          .filter((link) => link.studentId === student.id)
          .map((link) => {
            const guardian = personById(data.people, link.guardianId);
            return guardian ? `${fullName(guardian)} (${link.parentesco})` : null;
          })
          .filter(Boolean);
        return { student, term, guardians };
      })
      .filter((row) => {
        const sName = fullName(row.student).toLowerCase();
        const sDoc = row.student.documentNumber.toLowerCase();
        const matchesStudent = !sf || sName.includes(sf);
        const matchesDoc = !df || sDoc.includes(df);
        const matchesCourse =
          courseFilter === "all" || row.term?.courseId === courseFilter;

        return matchesStudent && matchesDoc && matchesCourse;
      });

    if (studentSort) {
      list.sort((a, b) => {
        const nameA = fullName(a.student);
        const nameB = fullName(b.student);
        const cmp = nameA.localeCompare(nameB, "es");
        return studentSort === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [data.courseTerms, data.enrollments, data.links, data.people, data.students, studentFilter, docFilter, courseFilter, studentSort]);

  return (
    <div>
      <PageHeader
        title="Consulta estudiantil"
        description="Vista de solo lectura para acompañamiento psicosocial: estudiantes, curso y acudientes. Filtre u ordene desde las cabeceras."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Consulta estudiantil" }]}
      />

      <Card>
        <CardContent className="space-y-4">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground">Filtros activos:</span>
                {studentSort && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Orden: {studentSort === "asc" ? "A → Z" : "Z → A"}
                  </Badge>
                )}
                {studentFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Estudiante: "{studentFilter}"
                  </Badge>
                )}
                {docFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Doc: "{docFilter}"
                  </Badge>
                )}
                {courseFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Curso: {data.courses.find((c) => c.id === courseFilter)?.code}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={clearAllFilters}
              >
                <RotateCcw className="size-3" />
                Limpiar filtros
              </Button>
            </div>
          )}

          {rows.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              description="No hay estudiantes que coincidan con los filtros aplicados."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Estudiante"
                      sort={studentSort}
                      onSortChange={setStudentSort}
                      filterValue={studentFilter}
                      onFilterChange={setStudentFilter}
                      placeholder="Buscar estudiante..."
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Documento"
                      filterValue={docFilter}
                      onFilterChange={setDocFilter}
                      placeholder="Buscar documento..."
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Curso"
                      filterValue={courseFilter}
                      onFilterChange={setCourseFilter}
                      filterType="select"
                      options={data.courses.map((c) => ({ label: c.code, value: c.id }))}
                    />
                  </TableHead>
                  <TableHead>Acudientes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.student.id}>
                    <TableCell className="font-medium">{fullName(row.student)}</TableCell>
                    <TableCell className="tabular">
                      {formatDocument(row.student.documentType, row.student.documentNumber)}
                    </TableCell>
                    <TableCell className="font-semibold text-brand-navy">
                      {row.term
                        ? `${courseById(data.courses, row.term.courseId)?.code} · ${yearById(data.years, row.term.yearId)?.year}`
                        : "Sin matrícula"}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {row.guardians.join(", ") || "Sin vínculo"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
