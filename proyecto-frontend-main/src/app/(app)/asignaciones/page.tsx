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
import { Input } from "@/components/ui/input";
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
import { fullName } from "@/lib/format";
import { courseById, yearById } from "@/lib/lookups";
import type { Jornada } from "@/lib/types";
import { useAppData } from "@/providers/data-provider";

export default function AssignmentsPage() {
  const data = useAppData();
  const teachers = useMemo(
    () => data.people.filter((person) => person.roleIds.includes("DOCENTE")),
    [data.people]
  );

  const [open, setOpen] = useState(false);
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [termId, setTermId] = useState(data.courseTerms[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");

  // Column header filter & sorting states
  const [teacherSort, setTeacherSort] = useState<"asc" | "desc" | null>(null);
  const [teacherFilter, setTeacherFilter] = useState("all");

  const [subjectSort, setSubjectSort] = useState<"asc" | "desc" | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [courseSort, setCourseSort] = useState<"asc" | "desc" | null>(null);
  const [courseFilter, setCourseFilter] = useState("all");

  const [yearSort, setYearSort] = useState<"asc" | "desc" | null>(null);
  const [yearFilter, setYearFilter] = useState("all");

  const [jornadaSort, setJornadaSort] = useState<"asc" | "desc" | null>(null);
  const [jornadaFilter, setJornadaFilter] = useState("all");

  const subjects = useMemo(
    () =>
      Array.from(new Set(data.assignments.map((item) => item.subject))).sort((a, b) =>
        a.localeCompare(b, "es")
      ),
    [data.assignments]
  );

  const hasActiveFilters =
    teacherSort !== null ||
    teacherFilter !== "all" ||
    subjectSort !== null ||
    subjectFilter !== "all" ||
    courseSort !== null ||
    courseFilter !== "all" ||
    yearSort !== null ||
    yearFilter !== "all" ||
    jornadaSort !== null ||
    jornadaFilter !== "all";

  const clearAllFilters = () => {
    setTeacherSort(null);
    setTeacherFilter("all");
    setSubjectSort(null);
    setSubjectFilter("all");
    setCourseSort(null);
    setCourseFilter("all");
    setYearSort(null);
    setYearFilter("all");
    setJornadaSort(null);
    setJornadaFilter("all");
  };

  const rows = useMemo(() => {
    const list = data.assignments
      .map((assignment) => {
        const teacher = data.people.find((person) => person.id === assignment.teacherId);
        const term = data.courseTerms.find((item) => item.id === assignment.courseTermId);
        if (!term) return null;
        return { assignment, teacher, term };
      })
      .filter((row): row is NonNullable<typeof row> => {
        if (!row) return false;
        const matchesTeacher =
          teacherFilter === "all" || row.assignment.teacherId === teacherFilter;
        const matchesCourse =
          courseFilter === "all" || row.term.courseId === courseFilter;
        const matchesYear =
          yearFilter === "all" || row.term.yearId === yearFilter;
        const matchesJornada =
          jornadaFilter === "all" || row.term.jornada === jornadaFilter;
        const matchesSubject =
          subjectFilter === "all" || row.assignment.subject === subjectFilter;
        return (
          matchesTeacher &&
          matchesCourse &&
          matchesYear &&
          matchesJornada &&
          matchesSubject
        );
      });

    // Sorting
    if (teacherSort) {
      list.sort((a, b) => {
        const nameA = a.teacher ? fullName(a.teacher) : "";
        const nameB = b.teacher ? fullName(b.teacher) : "";
        const cmp = nameA.localeCompare(nameB, "es");
        return teacherSort === "asc" ? cmp : -cmp;
      });
    } else if (subjectSort) {
      list.sort((a, b) => {
        const cmp = a.assignment.subject.localeCompare(b.assignment.subject, "es");
        return subjectSort === "asc" ? cmp : -cmp;
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
    } else if (jornadaSort) {
      list.sort((a, b) => {
        const cmp = a.term.jornada.localeCompare(b.term.jornada, "es");
        return jornadaSort === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [
    data.assignments,
    data.courseTerms,
    data.courses,
    data.people,
    data.years,
    teacherFilter,
    subjectFilter,
    courseFilter,
    yearFilter,
    jornadaFilter,
    teacherSort,
    subjectSort,
    courseSort,
    yearSort,
    jornadaSort,
  ]);

  function onSave(event: FormEvent) {
    event.preventDefault();
    if (!teacherId || !termId || !subject.trim()) {
      setError("Complete docente, vigencia y asignatura.");
      return;
    }
    data.addAssignment({
      id: `a-${Date.now()}`,
      teacherId,
      courseTermId: termId,
      subject: subject.trim(),
    });
    toast.success("Docente asignado");
    setOpen(false);
    setSubject("");
    setError("");
  }

  return (
    <div>
      <PageHeader
        title="Asignaciones docente–curso"
        description="Relación de docentes con las vigencias de curso que tienen a cargo. Ordene y filtre usando los botones en cada encabezado de columna."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Asignaciones" }]}
        actions={
          <Button
            className="h-9 gap-1.5"
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Asignar docente
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground">Filtros activos:</span>
                {teacherSort && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Docente: {teacherSort === "asc" ? "A → Z" : "Z → A"}
                  </Badge>
                )}
                {teacherFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Docente: {fullName(teachers.find((t) => t.id === teacherFilter) ?? teachers[0])}
                  </Badge>
                )}
                {subjectSort && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Asignatura: {subjectSort === "asc" ? "A → Z" : "Z → A"}
                  </Badge>
                )}
                {subjectFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Asignatura: {subjectFilter}
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
              title="Sin asignaciones"
              description="Ajuste los filtros de las cabeceras para ver la carga académica."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Docente"
                      sort={teacherSort}
                      onSortChange={setTeacherSort}
                      filterValue={teacherFilter}
                      onFilterChange={setTeacherFilter}
                      filterType="select"
                      options={teachers.map((t) => ({ label: fullName(t), value: t.id }))}
                    />
                  </TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Asignatura"
                      sort={subjectSort}
                      onSortChange={setSubjectSort}
                      filterValue={subjectFilter}
                      onFilterChange={setSubjectFilter}
                      filterType="select"
                      options={subjects.map((s) => ({ label: s, value: s }))}
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
                      sort={jornadaSort}
                      onSortChange={setJornadaSort}
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
                  <TableRow key={row.assignment.id}>
                    <TableCell className="font-medium">
                      {row.teacher ? fullName(row.teacher) : "—"}
                    </TableCell>
                    <TableCell className="font-semibold text-brand-navy">
                      {row.assignment.subject}
                    </TableCell>
                    <TableCell>{courseById(data.courses, row.term.courseId)?.code}</TableCell>
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
            <DialogTitle>Asignar docente</DialogTitle>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={onSave}>
            <div className="space-y-1.5">
              <Label>Docente</Label>
              <Select
                value={teacherId}
                items={Object.fromEntries(teachers.map((teacher) => [teacher.id, fullName(teacher)]))}
                onValueChange={(value) => setTeacherId(String(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {fullName(teacher)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vigencia</Label>
              <Select
                value={termId}
                items={Object.fromEntries(
                  data.courseTerms.map((term) => [
                    term.id,
                    `${courseById(data.courses, term.courseId)?.code} · ${yearById(data.years, term.yearId)?.year}`,
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
                      {yearById(data.years, term.yearId)?.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Asignatura</Label>
              <Input
                value={subject}
                placeholder="Ej. Matemáticas"
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Asignar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
