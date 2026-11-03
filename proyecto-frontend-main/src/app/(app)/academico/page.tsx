"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { ColumnHeaderFilter } from "@/components/shared/column-header-filter";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fullName } from "@/lib/format";
import { courseById, gradeById, yearById } from "@/lib/lookups";
import type { CourseTerm, Jornada } from "@/lib/types";
import { useAppData } from "@/providers/data-provider";

export default function AcademicPage() {
  const data = useAppData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseTerm | null>(null);
  const [form, setForm] = useState({
    courseId: data.courses[0]?.id ?? "",
    yearId: data.years.find((year) => year.status === "VIGENTE")?.id ?? "",
    directorId: data.people.find((person) => person.roleIds.includes("DOCENTE"))?.id ?? "",
    jornada: "MAÑANA" as Jornada,
    capacity: "36",
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("years");

  const teachers = useMemo(
    () => data.people.filter((person) => person.roleIds.includes("DOCENTE")),
    [data.people]
  );

  // Filters & sorting for Años lectivos
  const [yearSort, setYearSort] = useState<"asc" | "desc" | null>(null);
  const [yearFilter, setYearFilter] = useState("");
  const [yearNameSort, setYearNameSort] = useState<"asc" | "desc" | null>(null);
  const [yearNameFilter, setYearNameFilter] = useState("");
  const [yearStatusFilter, setYearStatusFilter] = useState("all");

  const filteredYears = useMemo(() => {
    const yf = yearFilter.trim().toLowerCase();
    const ynf = yearNameFilter.trim().toLowerCase();
    const list = data.years.filter((item) => {
      const matchesYear = !yf || String(item.year).includes(yf);
      const matchesName = !ynf || item.label.toLowerCase().includes(ynf);
      const matchesStatus = yearStatusFilter === "all" || item.status === yearStatusFilter;
      return matchesYear && matchesName && matchesStatus;
    });

    if (yearSort) {
      list.sort((a, b) => (yearSort === "asc" ? a.year - b.year : b.year - a.year));
    } else if (yearNameSort) {
      list.sort((a, b) => {
        const cmp = a.label.localeCompare(b.label, "es");
        return yearNameSort === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [data.years, yearFilter, yearNameFilter, yearStatusFilter, yearSort, yearNameSort]);

  // Filters & sorting for Vigencias de curso
  const [termCourseSort, setTermCourseSort] = useState<"asc" | "desc" | null>(null);
  const [termCourseFilter, setTermCourseFilter] = useState("");
  const [termYearSort, setTermYearSort] = useState<"asc" | "desc" | null>(null);
  const [termYearFilter, setTermYearFilter] = useState("all");
  const [termDirectorSort, setTermDirectorSort] = useState<"asc" | "desc" | null>(null);
  const [termDirectorFilter, setTermDirectorFilter] = useState("");
  const [termJornadaFilter, setTermJornadaFilter] = useState("all");
  const [termCupoSort, setTermCupoSort] = useState<"asc" | "desc" | null>(null);

  const filteredTerms = useMemo(() => {
    const tcf = termCourseFilter.trim().toLowerCase();
    const tdf = termDirectorFilter.trim().toLowerCase();

    const list = data.courseTerms.filter((term) => {
      const course = courseById(data.courses, term.courseId);
      const courseCode = course?.code.toLowerCase() ?? "";
      const director = data.people.find((p) => p.id === term.directorId);
      const directorName = director ? fullName(director).toLowerCase() : "";

      const matchesCourse = !tcf || courseCode.includes(tcf);
      const matchesYear = termYearFilter === "all" || term.yearId === termYearFilter;
      const matchesDirector = !tdf || directorName.includes(tdf);
      const matchesJornada = termJornadaFilter === "all" || term.jornada === termJornadaFilter;

      return matchesCourse && matchesYear && matchesDirector && matchesJornada;
    });

    if (termCourseSort) {
      list.sort((a, b) => {
        const cA = courseById(data.courses, a.courseId)?.code ?? "";
        const cB = courseById(data.courses, b.courseId)?.code ?? "";
        const cmp = cA.localeCompare(cB, "es");
        return termCourseSort === "asc" ? cmp : -cmp;
      });
    } else if (termYearSort) {
      list.sort((a, b) => {
        const yA = yearById(data.years, a.yearId)?.year ?? 0;
        const yB = yearById(data.years, b.yearId)?.year ?? 0;
        return termYearSort === "asc" ? yA - yB : yB - yA;
      });
    } else if (termDirectorSort) {
      list.sort((a, b) => {
        const dA = data.people.find((p) => p.id === a.directorId);
        const dB = data.people.find((p) => p.id === b.directorId);
        const nameA = dA ? fullName(dA) : "";
        const nameB = dB ? fullName(dB) : "";
        const cmp = nameA.localeCompare(nameB, "es");
        return termDirectorSort === "asc" ? cmp : -cmp;
      });
    } else if (termCupoSort) {
      list.sort((a, b) => (termCupoSort === "asc" ? a.capacity - b.capacity : b.capacity - a.capacity));
    }

    return list;
  }, [
    data.courseTerms,
    data.courses,
    data.years,
    data.people,
    termCourseFilter,
    termYearFilter,
    termDirectorFilter,
    termJornadaFilter,
    termCourseSort,
    termYearSort,
    termDirectorSort,
    termCupoSort,
  ]);

  // Filters & sorting for Grados
  const [gradeSort, setGradeSort] = useState<"asc" | "desc" | null>(null);
  const [gradeFilter, setGradeFilter] = useState("");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("all");

  const filteredGrades = useMemo(() => {
    const gf = gradeFilter.trim().toLowerCase();
    const list = data.grades.filter((item) => {
      const matchesName = !gf || item.name.toLowerCase().includes(gf);
      const matchesLevel = gradeLevelFilter === "all" || String(item.level) === gradeLevelFilter;
      return matchesName && matchesLevel;
    });
    if (gradeSort) {
      list.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name, "es");
        return gradeSort === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [data.grades, gradeFilter, gradeLevelFilter, gradeSort]);

  // Filters & sorting for Cursos
  const [courseCodeSort, setCourseCodeSort] = useState<"asc" | "desc" | null>(null);
  const [courseCodeFilter, setCourseCodeFilter] = useState("");
  const [courseGradeFilter, setCourseGradeFilter] = useState("all");

  const filteredCourses = useMemo(() => {
    const ccf = courseCodeFilter.trim().toLowerCase();
    const list = data.courses.filter((course) => {
      const matchesCode = !ccf || course.code.toLowerCase().includes(ccf);
      const matchesGrade = courseGradeFilter === "all" || course.gradeId === courseGradeFilter;
      return matchesCode && matchesGrade;
    });
    if (courseCodeSort) {
      list.sort((a, b) => {
        const cmp = a.code.localeCompare(b.code, "es");
        return courseCodeSort === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [data.courses, courseCodeFilter, courseGradeFilter, courseCodeSort]);

  function openCreate() {
    setEditing(null);
    setForm({
      courseId: data.courses[0]?.id ?? "",
      yearId: data.years.find((year) => year.status === "VIGENTE")?.id ?? "",
      directorId: teachers[0]?.id ?? "",
      jornada: "MAÑANA",
      capacity: "36",
    });
    setError("");
    setOpen(true);
  }

  function openEdit(term: CourseTerm) {
    setEditing(term);
    setForm({
      courseId: term.courseId,
      yearId: term.yearId,
      directorId: term.directorId,
      jornada: term.jornada,
      capacity: String(term.capacity),
    });
    setError("");
    setOpen(true);
  }

  function onSave(event: FormEvent) {
    event.preventDefault();
    const capacity = Number(form.capacity);
    if (!form.courseId || !form.yearId || !form.directorId) {
      setError("Complete curso, año y director.");
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 10 || capacity > 50) {
      setError("El cupo debe estar entre 10 y 50.");
      return;
    }
    data.upsertTerm({
      id: editing?.id ?? `t-${Date.now()}`,
      courseId: form.courseId,
      yearId: form.yearId,
      directorId: form.directorId,
      jornada: form.jornada,
      capacity,
    });
    toast.success(editing ? "Vigencia actualizada" : "Vigencia creada");
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Estructura académica"
        description="Años lectivos, grados, cursos y vigencias de la institución. Puede ordenar y filtrar directamente desde las cabeceras de cada tabla."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Estructura académica" }]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex items-center gap-2">
          <TabsList variant="line" className="h-auto flex-1 justify-start overflow-x-auto">
            <TabsTrigger value="years">Años lectivos</TabsTrigger>
            <TabsTrigger value="grades">Grados</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="terms">Vigencias de curso</TabsTrigger>
          </TabsList>
          {activeTab === "terms" && (
            <Button className="h-9 gap-1.5 whitespace-nowrap" onClick={openCreate}>
              <Plus className="size-4" />
              Nueva vigencia
            </Button>
          )}
        </div>

        {/* Tab: Años lectivos */}
        <TabsContent value="years">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Año"
                        sort={yearSort}
                        onSortChange={setYearSort}
                        sortType="numeric"
                        filterValue={yearFilter}
                        onFilterChange={setYearFilter}
                        placeholder="Filtrar año..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Nombre"
                        sort={yearNameSort}
                        onSortChange={setYearNameSort}
                        filterValue={yearNameFilter}
                        onFilterChange={setYearNameFilter}
                        placeholder="Filtrar nombre..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Estado"
                        filterValue={yearStatusFilter}
                        onFilterChange={setYearStatusFilter}
                        filterType="select"
                        options={[
                          { label: "Vigente", value: "VIGENTE" },
                          { label: "Cerrado", value: "CERRADO" },
                        ]}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell className="tabular font-medium">{year.year}</TableCell>
                      <TableCell>{year.label}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            year.status === "VIGENTE"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }
                        >
                          {year.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredYears.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                        No se encontraron años lectivos con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Grados */}
        <TabsContent value="grades">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Grado"
                        sort={gradeSort}
                        onSortChange={setGradeSort}
                        filterValue={gradeFilter}
                        onFilterChange={setGradeFilter}
                        placeholder="Filtrar grado..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Nivel"
                        filterValue={gradeLevelFilter}
                        onFilterChange={setGradeLevelFilter}
                        filterType="select"
                        options={Array.from(new Set(data.grades.map((g) => g.level)))
                          .sort((a, b) => a - b)
                          .map((lvl) => ({ label: `Nivel ${lvl}`, value: String(lvl) }))}
                      />
                    </TableHead>
                    <TableHead>Cursos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.name}</TableCell>
                      <TableCell className="tabular">{grade.level}</TableCell>
                      <TableCell>
                        {data.courses
                          .filter((course) => course.gradeId === grade.id)
                          .map((course) => course.code)
                          .join(", ")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredGrades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                        No se encontraron grados con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cursos */}
        <TabsContent value="courses">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Código"
                        sort={courseCodeSort}
                        onSortChange={setCourseCodeSort}
                        filterValue={courseCodeFilter}
                        onFilterChange={setCourseCodeFilter}
                        placeholder="Filtrar código..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Grado"
                        filterValue={courseGradeFilter}
                        onFilterChange={setCourseGradeFilter}
                        filterType="select"
                        options={data.grades.map((g) => ({ label: g.name, value: g.id }))}
                      />
                    </TableHead>
                    <TableHead>Vigencias</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{gradeById(data.grades, course.gradeId)?.name}</TableCell>
                      <TableCell className="tabular">
                        {data.courseTerms.filter((term) => term.courseId === course.id).length}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCourses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                        No se encontraron cursos con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Vigencias de curso */}
        <TabsContent value="terms">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Curso"
                        sort={termCourseSort}
                        onSortChange={setTermCourseSort}
                        filterValue={termCourseFilter}
                        onFilterChange={setTermCourseFilter}
                        placeholder="Filtrar curso..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Año"
                        sort={termYearSort}
                        onSortChange={setTermYearSort}
                        filterValue={termYearFilter}
                        onFilterChange={setTermYearFilter}
                        filterType="select"
                        options={data.years.map((y) => ({ label: String(y.year), value: y.id }))}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Director"
                        sort={termDirectorSort}
                        onSortChange={setTermDirectorSort}
                        filterValue={termDirectorFilter}
                        onFilterChange={setTermDirectorFilter}
                        placeholder="Filtrar director..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Jornada"
                        filterValue={termJornadaFilter}
                        onFilterChange={setTermJornadaFilter}
                        filterType="select"
                        options={[
                          { label: "Mañana", value: "MAÑANA" },
                          { label: "Tarde", value: "TARDE" },
                        ]}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Cupo"
                        sort={termCupoSort}
                        onSortChange={setTermCupoSort}
                        sortType="numeric"
                      />
                    </TableHead>
                    <TableHead className="w-16 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTerms.map((term) => {
                    const director = data.people.find((person) => person.id === term.directorId);
                    return (
                      <TableRow key={term.id}>
                        <TableCell className="font-semibold text-brand-navy">
                          {courseById(data.courses, term.courseId)?.code}
                        </TableCell>
                        <TableCell className="tabular">
                          {yearById(data.years, term.yearId)?.year}
                        </TableCell>
                        <TableCell>{director ? fullName(director) : "—"}</TableCell>
                        <TableCell>{term.jornada}</TableCell>
                        <TableCell className="tabular">{term.capacity}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-8 text-slate-600 hover:text-brand-navy hover:bg-brand-navy/10 cursor-pointer"
                            onClick={() => openEdit(term)}
                            title="Editar vigencia"
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTerms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                        No se encontraron vigencias con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar vigencia" : "Nueva vigencia"}</DialogTitle>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={onSave}>
            <div className="space-y-1.5">
              <Label>Curso</Label>
              <Select
                value={form.courseId}
                items={Object.fromEntries(data.courses.map((course) => [course.id, course.code]))}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, courseId: String(value) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Año lectivo</Label>
              <Select
                value={form.yearId}
                items={Object.fromEntries(data.years.map((year) => [year.id, year.label]))}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, yearId: String(value) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Director de grupo</Label>
              <Select
                value={form.directorId}
                items={Object.fromEntries(teachers.map((teacher) => [teacher.id, fullName(teacher)]))}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, directorId: String(value) }))
                }
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jornada</Label>
                <Select
                  value={form.jornada}
                  items={{ MAÑANA: "Mañana", TARDE: "Tarde" }}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, jornada: value as Jornada }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAÑANA">Mañana</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cupo</Label>
                <Input
                  value={form.capacity}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, capacity: event.target.value }))
                  }
                />
              </div>
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
