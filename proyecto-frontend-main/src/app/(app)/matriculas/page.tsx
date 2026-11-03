"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeaderFilter } from "@/components/shared/column-header-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDocument, fullName } from "@/lib/format";
import { courseById, yearById } from "@/lib/lookups";
import { useAppData } from "@/providers/data-provider";

export default function EnrollmentsPage() {
  const data = useAppData();

  // Column header filter & sorting states
  const [studentSort, setStudentSort] = useState<"asc" | "desc" | null>(null);
  const [studentFilter, setStudentFilter] = useState("");
  const [docFilter, setDocFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [courseSort, setCourseSort] = useState<"asc" | "desc" | null>(null);
  const [yearFilter, setYearFilter] = useState("all");
  const [yearSort, setYearSort] = useState<"asc" | "desc" | null>(null);
  const [jornadaFilter, setJornadaFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState(data.students[0]?.id ?? "");
  const [termId, setTermId] = useState(data.courseTerms[0]?.id ?? "");
  const [error, setError] = useState("");

  const hasActiveFilters =
    studentSort !== null ||
    !!studentFilter.trim() ||
    !!docFilter.trim() ||
    courseFilter !== "all" ||
    courseSort !== null ||
    yearFilter !== "all" ||
    yearSort !== null ||
    jornadaFilter !== "all";

  const clearAllFilters = () => {
    setStudentSort(null);
    setStudentFilter("");
    setDocFilter("");
    setCourseFilter("all");
    setCourseSort(null);
    setYearFilter("all");
    setYearSort(null);
    setJornadaFilter("all");
  };

  const rows = useMemo(() => {
    const sf = studentFilter.trim().toLowerCase();
    const df = docFilter.trim().toLowerCase();

    const list = data.enrollments
      .map((enrollment) => {
        const term = data.courseTerms.find((item) => item.id === enrollment.courseTermId);
        const student = data.students.find((item) => item.id === enrollment.studentId);
        if (!term || !student) return null;
        return { enrollment, term, student };
      })
      .filter((row): row is NonNullable<typeof row> => {
        if (!row) return false;
        const matchesStudent = !sf || fullName(row.student).toLowerCase().includes(sf);
        const matchesDoc = !df || row.student.documentNumber.toLowerCase().includes(df);
        const matchesYear = yearFilter === "all" || row.term.yearId === yearFilter;
        const matchesCourse = courseFilter === "all" || row.term.courseId === courseFilter;
        const matchesJornada = jornadaFilter === "all" || row.term.jornada === jornadaFilter;
        return matchesStudent && matchesDoc && matchesYear && matchesCourse && matchesJornada;
      });

    // Sorting
    if (studentSort) {
      list.sort((a, b) => {
        const nameA = fullName(a.student);
        const nameB = fullName(b.student);
        const cmp = nameA.localeCompare(nameB, "es");
        return studentSort === "asc" ? cmp : -cmp;
      });
    } else if (courseSort) {
      list.sort((a, b) => {
        const cA = courseById(data.courses, a.term.courseId)?.code ?? "";
        const cB = courseById(data.courses, b.term.courseId)?.code ?? "";
        const cmp = cA.localeCompare(cB, "es");
        return courseSort === "asc" ? cmp : -cmp;
      });
    } else if (yearSort) {
      list.sort((a, b) => {
        const yA = yearById(data.years, a.term.yearId)?.year ?? 0;
        const yB = yearById(data.years, b.term.yearId)?.year ?? 0;
        return yearSort === "asc" ? yA - yB : yB - yA;
      });
    }

    return list;
  }, [
    data.enrollments,
    data.courseTerms,
    data.students,
    data.courses,
    data.years,
    studentFilter,
    docFilter,
    yearFilter,
    courseFilter,
    jornadaFilter,
    studentSort,
    courseSort,
    yearSort,
  ]);

  function onSave(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !termId) {
      setError("Seleccione estudiante y curso.");
      return;
    }
    const exists = data.enrollments.some(
      (item) => item.studentId === studentId && item.courseTermId === termId
    );
    if (exists) {
      setError("Ese estudiante ya está matriculado en esa vigencia.");
      return;
    }
    data.addEnrollment({
      id: `e-${Date.now()}`,
      studentId,
      courseTermId: termId,
    });
    toast.success("Estudiante matriculado");
    setOpen(false);
    setError("");
  }

  return (
    <div>
      <PageHeader
        title="Matrículas"
        description="Estudiantes inscritos por curso y año lectivo. Filtre u ordene desde los botones en cada cabecera."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Matrículas" }]}
        actions={
          <Button
            className="h-9 gap-1.5"
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Matricular estudiante
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground">Filtros activos:</span>
                {studentSort && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Estudiante: {studentSort === "asc" ? "A → Z" : "Z → A"}
                  </Badge>
                )}
                {studentFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Nombre: "{studentFilter}"
                  </Badge>
                )}
                {docFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Documento: "{docFilter}"
                  </Badge>
                )}
                {courseFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Curso: {data.courses.find((c) => c.id === courseFilter)?.code}
                  </Badge>
                )}
                {yearFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Año: {data.years.find((y) => y.id === yearFilter)?.label}
                  </Badge>
                )}
                {jornadaFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Jornada: {jornadaFilter}
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
              title="No hay matrículas"
              description="Ajuste los filtros de las cabeceras o matricule un estudiante."
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
                      placeholder="Filtrar estudiante..."
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Documento"
                      filterValue={docFilter}
                      onFilterChange={setDocFilter}
                      placeholder="Filtrar documento..."
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Curso"
                      sort={courseSort}
                      onSortChange={setCourseSort}
                      filterValue={courseFilter}
                      onFilterChange={setCourseFilter}
                      filterType="select"
                      options={data.courses.map((c) => ({ label: c.code, value: c.id }))}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Año"
                      sort={yearSort}
                      onSortChange={setYearSort}
                      filterValue={yearFilter}
                      onFilterChange={setYearFilter}
                      filterType="select"
                      options={data.years.map((y) => ({ label: y.label, value: y.id }))}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Jornada"
                      filterValue={jornadaFilter}
                      onFilterChange={setJornadaFilter}
                      filterType="select"
                      options={[
                        { label: "Mañana", value: "MAÑANA" },
                        { label: "Tarde", value: "TARDE" },
                      ]}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.enrollment.id}>
                    <TableCell className="font-medium">{fullName(row.student)}</TableCell>
                    <TableCell className="tabular">
                      {formatDocument(row.student.documentType, row.student.documentNumber)}
                    </TableCell>
                    <TableCell className="font-semibold text-brand-navy">
                      {courseById(data.courses, row.term.courseId)?.code}
                    </TableCell>
                    <TableCell className="tabular">
                      {yearById(data.years, row.term.yearId)?.year}
                    </TableCell>
                    <TableCell>{row.term.jornada}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Matricular estudiante</DialogTitle>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={onSave}>
            <div className="space-y-1.5">
              <Label>Estudiante</Label>
              <Select
                value={studentId}
                items={Object.fromEntries(
                  data.students.map((student) => [student.id, fullName(student)])
                )}
                onValueChange={(value) => setStudentId(String(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {fullName(student)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vigencia de curso</Label>
              <Select
                value={termId}
                items={Object.fromEntries(
                  data.courseTerms.map((term) => [
                    term.id,
                    `${courseById(data.courses, term.courseId)?.code} · ${yearById(data.years, term.yearId)?.year} · ${term.jornada}`,
                  ])
                )}
                onValueChange={(value) => setTermId(String(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.courseTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {courseById(data.courses, term.courseId)?.code} ·{" "}
                      {yearById(data.years, term.yearId)?.year} · {term.jornada}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Matricular</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
