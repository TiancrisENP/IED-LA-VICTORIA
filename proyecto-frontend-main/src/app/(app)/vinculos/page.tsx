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
import type { Parentesco } from "@/lib/types";
import { useAppData } from "@/providers/data-provider";

const parentescos: Parentesco[] = [
  "Madre",
  "Padre",
  "Abuela",
  "Abuelo",
  "Tío",
  "Tía",
  "Hermano",
  "Tutor legal",
];

export default function LinksPage() {
  const data = useAppData();
  const guardians = useMemo(
    () => data.people.filter((person) => person.roleIds.includes("ACUDIENTE")),
    [data.people]
  );

  const [open, setOpen] = useState(false);
  const [guardianId, setGuardianId] = useState(guardians[0]?.id ?? "");
  const [studentId, setStudentId] = useState(data.students[0]?.id ?? "");
  const [parentesco, setParentesco] = useState<Parentesco>("Madre");
  const [error, setError] = useState("");

  // Column header filter & sorting states
  const [guardianSort, setGuardianSort] = useState<"asc" | "desc" | null>(null);
  const [guardianFilter, setGuardianFilter] = useState("");
  const [studentSort, setStudentSort] = useState<"asc" | "desc" | null>(null);
  const [studentFilter, setStudentFilter] = useState("");
  const [parentescoFilter, setParentescoFilter] = useState("all");

  const hasActiveFilters =
    guardianSort !== null ||
    !!guardianFilter.trim() ||
    studentSort !== null ||
    !!studentFilter.trim() ||
    parentescoFilter !== "all";

  const clearAllFilters = () => {
    setGuardianSort(null);
    setGuardianFilter("");
    setStudentSort(null);
    setStudentFilter("");
    setParentescoFilter("all");
  };

  function studentCourse(studentId: string) {
    const enrollment = data.enrollments.find((item) => item.studentId === studentId);
    const term = data.courseTerms.find((item) => item.id === enrollment?.courseTermId);
    if (!term) return "Sin matrícula";
    return `${courseById(data.courses, term.courseId)?.code} · ${yearById(data.years, term.yearId)?.year}`;
  }

  const rows = useMemo(() => {
    const gf = guardianFilter.trim().toLowerCase();
    const sf = studentFilter.trim().toLowerCase();

    const list = data.links
      .map((link) => {
        const guardian = data.people.find((person) => person.id === link.guardianId);
        const student = data.students.find((item) => item.id === link.studentId);
        if (!guardian || !student) return null;
        return { link, guardian, student };
      })
      .filter((row): row is NonNullable<typeof row> => {
        if (!row) return false;
        const gName = fullName(row.guardian).toLowerCase();
        const sName = fullName(row.student).toLowerCase();
        const matchesGuardian = !gf || gName.includes(gf);
        const matchesStudent = !sf || sName.includes(sf);
        const matchesParentesco =
          parentescoFilter === "all" || row.link.parentesco === parentescoFilter;
        return matchesGuardian && matchesStudent && matchesParentesco;
      });

    if (guardianSort) {
      list.sort((a, b) => {
        const cmp = fullName(a.guardian).localeCompare(fullName(b.guardian), "es");
        return guardianSort === "asc" ? cmp : -cmp;
      });
    } else if (studentSort) {
      list.sort((a, b) => {
        const cmp = fullName(a.student).localeCompare(fullName(b.student), "es");
        return studentSort === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [data.links, data.people, data.students, guardianFilter, studentFilter, parentescoFilter, guardianSort, studentSort]);

  function onSave(event: FormEvent) {
    event.preventDefault();
    if (!guardianId || !studentId) {
      setError("Seleccione acudiente y estudiante.");
      return;
    }
    const exists = data.links.some(
      (link) => link.guardianId === guardianId && link.studentId === studentId
    );
    if (exists) {
      setError("Ese vínculo ya está registrado.");
      return;
    }
    data.addLink({
      id: `v-${Date.now()}`,
      guardianId,
      studentId,
      parentesco,
    });
    toast.success("Vínculo creado");
    setOpen(false);
    setError("");
  }

  return (
    <div>
      <PageHeader
        title="Vínculos acudiente–estudiante"
        description="Parentesco entre acudientes y estudiantes matriculados. Filtre u ordene desde las cabeceras de la tabla."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Vínculos" }]}
        actions={
          <Button
            className="h-9 gap-1.5"
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Crear vínculo
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground">Filtros activos:</span>
                {guardianSort && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Acudiente: {guardianSort === "asc" ? "A → Z" : "Z → A"}
                  </Badge>
                )}
                {guardianFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Acudiente: "{guardianFilter}"
                  </Badge>
                )}
                {studentSort && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Estudiante: {studentSort === "asc" ? "A → Z" : "Z → A"}
                  </Badge>
                )}
                {studentFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Estudiante: "{studentFilter}"
                  </Badge>
                )}
                {parentescoFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Parentesco: {parentescoFilter}
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
              title="Sin vínculos"
              description="No hay vínculos que coincidan con los filtros aplicados."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Acudiente"
                      sort={guardianSort}
                      onSortChange={setGuardianSort}
                      filterValue={guardianFilter}
                      onFilterChange={setGuardianFilter}
                      placeholder="Buscar acudiente..."
                    />
                  </TableHead>
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
                  <TableHead>Documento</TableHead>
                  <TableHead>
                    <ColumnHeaderFilter
                      title="Parentesco"
                      filterValue={parentescoFilter}
                      onFilterChange={setParentescoFilter}
                      filterType="select"
                      options={parentescos.map((p) => ({ label: p, value: p }))}
                    />
                  </TableHead>
                  <TableHead>Curso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ link, guardian, student }) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{fullName(guardian)}</TableCell>
                    <TableCell>{fullName(student)}</TableCell>
                    <TableCell className="tabular">
                      {formatDocument(student.documentType, student.documentNumber)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs">
                        {link.parentesco}
                      </Badge>
                    </TableCell>
                    <TableCell>{studentCourse(student.id)}</TableCell>
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
            <DialogTitle>Crear vínculo</DialogTitle>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={onSave}>
            <div className="space-y-1.5">
              <Label>Acudiente</Label>
              <Select
                value={guardianId}
                items={Object.fromEntries(
                  guardians.map((guardian) => [guardian.id, fullName(guardian)])
                )}
                onValueChange={(value) => setGuardianId(String(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {guardians.map((guardian) => (
                    <SelectItem key={guardian.id} value={guardian.id}>
                      {fullName(guardian)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label>Parentesco</Label>
              <Select
                value={parentesco}
                items={Object.fromEntries(parentescos.map((item) => [item, item]))}
                onValueChange={(value) => setParentesco(value as Parentesco)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {parentescos.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
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
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
