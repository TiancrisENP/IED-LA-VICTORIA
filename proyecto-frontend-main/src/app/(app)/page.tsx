"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Search,
  Shield,
  Users,
} from "lucide-react";

import { InstitutionMark } from "@/components/brand/institution-mark";
import { PageHeader } from "@/components/shared/page-header";
import { RoleBadge } from "@/components/shared/role-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatDocument, fullName } from "@/lib/format";
import { courseById, gradeById, personById, termLabel, yearById } from "@/lib/lookups";
import { navForRole } from "@/lib/navigation";
import { useAppData } from "@/providers/data-provider";
import { useSession } from "@/providers/session-provider";
import { useTenant } from "@/providers/tenant-provider";

type MetricModalType = "registered" | "active" | "courses" | "students" | null;

export default function DashboardPage() {
  const { role, currentUser } = useSession();
  const { tenant } = useTenant();
  const data = useAppData();
  const shortcuts = navForRole(role).filter((item) => item.href !== "/");

  const [activeMetric, setActiveMetric] = useState<MetricModalType>(null);
  const [modalSearch, setModalSearch] = useState("");

  const activePeople = useMemo(
    () => data.people.filter((person) => person.status === "ACTIVO"),
    [data.people]
  );
  const currentYear = data.years.find((year) => year.status === "VIGENTE");
  const currentTerms = useMemo(
    () => data.courseTerms.filter((term) => term.yearId === currentYear?.id),
    [data.courseTerms, currentYear?.id]
  );
  const enrolled = useMemo(
    () =>
      data.enrollments.filter((item) =>
        currentTerms.some((term) => term.id === item.courseTermId)
      ),
    [data.enrollments, currentTerms]
  );

  const teacherTerms = data.courseTerms.filter(
    (term) =>
      term.yearId === currentYear?.id &&
      (term.directorId === currentUser.id ||
        data.assignments.some(
          (assignment) =>
            assignment.teacherId === currentUser.id && assignment.courseTermId === term.id
        ))
  );

  const wards = data.links
    .filter((link) => link.guardianId === currentUser.id)
    .map((link) => data.students.find((student) => student.id === link.studentId))
    .filter(Boolean);

  const handleOpenMetric = (metric: MetricModalType) => {
    setModalSearch("");
    setActiveMetric(metric);
  };

  // Filtered lists for the modals
  const filteredRegisteredUsers = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return data.people;
    return data.people.filter((p) =>
      `${fullName(p)} ${p.documentNumber} ${p.email}`.toLowerCase().includes(q)
    );
  }, [data.people, modalSearch]);

  const filteredActiveUsers = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return activePeople;
    return activePeople.filter((p) =>
      `${fullName(p)} ${p.documentNumber} ${p.email}`.toLowerCase().includes(q)
    );
  }, [activePeople, modalSearch]);

  const filteredCourses = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return currentTerms;
    return currentTerms.filter((term) => {
      const course = courseById(data.courses, term.courseId);
      const grade = course ? gradeById(data.grades, course.gradeId) : null;
      const director = data.people.find((p) => p.id === term.directorId);
      const directorName = director ? fullName(director) : "";
      const searchStr = `${course?.code ?? ""} ${grade?.name ?? ""} ${directorName} ${term.jornada}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [currentTerms, data.courses, data.grades, data.people, modalSearch]);

  const filteredEnrollments = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    return enrolled
      .map((enrollment) => {
        const student = data.students.find((s) => s.id === enrollment.studentId);
        const term = currentTerms.find((t) => t.id === enrollment.courseTermId);
        const course = term ? courseById(data.courses, term.courseId) : null;
        if (!student || !term) return null;
        return { enrollment, student, term, course };
      })
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;
        if (!q) return true;
        const searchStr = `${fullName(item.student)} ${item.student.documentNumber} ${item.course?.code ?? ""} ${item.term.jornada}`.toLowerCase();
        return searchStr.includes(q);
      });
  }, [enrolled, data.students, currentTerms, data.courses, modalSearch]);

  return (
    <div>
      <section className="relative mb-6 overflow-hidden rounded-xl ring-1 ring-brand-navy/15">
        <img
          src="/brand/campus.png"
          alt="Sede IED La Victoria"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy/72" />
        <div className="relative flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6">
          <InstitutionMark size={72} className="rounded-md bg-white/95 p-1 shadow-sm" />
          <div className="min-w-0 text-white">
            <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-white/75">
              {tenant.legalName}
            </p>
            <h2 className="mt-0.5 font-heading text-xl font-semibold sm:text-2xl">
              {tenant.shortName}
            </h2>
            <p className="mt-1 text-sm font-medium tracking-wide text-brand-gold uppercase">
              {tenant.motto}
            </p>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              {tenant.moduleName} · {tenant.city}
            </p>
          </div>
        </div>
      </section>

      <PageHeader
        title="Panel de inicio"
        description={`Sesión de ${fullName(currentUser)}. Datos cargados desde el API NestJS + Supabase.`}
      />

      {role === "ACUDIENTE" ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sus acudidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {wards.length === 0 ? (
              <p className="text-muted-foreground">No hay estudiantes vinculados.</p>
            ) : (
              wards.map((student) =>
                student ? (
                  <p key={student.id}>
                    {fullName(student)} · {student.documentType} {student.documentNumber}
                  </p>
                ) : null
              )
            )}
            <Button nativeButton={false} render={<Link href="/acudidos" />} variant="outline" size="sm">
              Ver ficha completa
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {role === "DOCENTE" ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cursos a su cargo · {currentYear?.year}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {teacherTerms.map((term) => (
              <p key={term.id}>{termLabel(term, data.courses, data.years)} · {term.jornada}</p>
            ))}
            <Button nativeButton={false} render={<Link href="/mis-cursos" />} variant="outline" size="sm">
              Abrir mis cursos
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Interactive Summary Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Usuarios registrados"
          value={data.people.length}
          subtitle="Ver listado de usuarios"
          onClick={() => handleOpenMetric("registered")}
        />
        <SummaryCard
          icon={Shield}
          label="Usuarios activos"
          value={activePeople.length}
          subtitle="Ver usuarios activos"
          onClick={() => handleOpenMetric("active")}
        />
        <SummaryCard
          icon={GraduationCap}
          label="Cursos vigentes"
          value={currentTerms.length}
          subtitle="Ver cursos año lectivo"
          onClick={() => handleOpenMetric("courses")}
        />
        <SummaryCard
          icon={BookOpen}
          label="Estudiantes matriculados"
          value={enrolled.length}
          subtitle="Ver estudiantes matriculados"
          onClick={() => handleOpenMetric("students")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Últimas acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.audit.slice(0, 6).map((record) => {
                  const actor = personById(data.people, record.userId);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="tabular text-muted-foreground">
                        {formatDateTime(record.date)}
                      </TableCell>
                      <TableCell>{actor ? fullName(actor) : "Sistema"}</TableCell>
                      <TableCell>{record.action}</TableCell>
                      <TableCell>{record.entity}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {shortcuts.map((item) => (
              <Button
                key={item.href}
                variant="outline"
                className="h-9 justify-start"
                nativeButton={false}
                render={<Link href={item.href} />}
              >
                <item.icon />
                {item.label}
              </Button>
            ))}
            <div className="pt-2">
              <p className="mb-2 text-xs text-muted-foreground">Rol en esta sesión</p>
              <RoleBadge role={role} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Metric Detail Modal */}
      <Dialog
        open={activeMetric !== null}
        onOpenChange={(open) => {
          if (!open) setActiveMetric(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeMetric === "registered" && (
                <>
                  <Users className="size-5 text-brand-navy" />
                  <span>Usuarios registrados ({data.people.length})</span>
                </>
              )}
              {activeMetric === "active" && (
                <>
                  <Shield className="size-5 text-emerald-600" />
                  <span>Usuarios activos ({activePeople.length})</span>
                </>
              )}
              {activeMetric === "courses" && (
                <>
                  <GraduationCap className="size-5 text-brand-navy" />
                  <span>Cursos vigentes · {currentYear?.year} ({currentTerms.length})</span>
                </>
              )}
              {activeMetric === "students" && (
                <>
                  <BookOpen className="size-5 text-brand-navy" />
                  <span>Estudiantes matriculados · {currentYear?.year} ({enrolled.length})</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {activeMetric === "registered" && "Listado completo de personas registradas en el módulo de usuarios."}
              {activeMetric === "active" && "Listado de usuarios con estado ACTIVO en el módulo de usuarios."}
              {activeMetric === "courses" && "Vigencias de cursos habilitadas para el año lectivo en Estructura académica."}
              {activeMetric === "students" && "Estudiantes con matrícula activa registrada para el año lectivo."}
            </DialogDescription>
          </DialogHeader>

          {/* Quick Search inside Modal */}
          <div className="relative my-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              placeholder="Filtrar en este listado..."
              className="h-9 pl-9 text-sm"
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border/70">
            {activeMetric === "registered" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegisteredUsers.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{fullName(person)}</TableCell>
                      <TableCell className="tabular">
                        {formatDocument(person.documentType, person.documentNumber)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {person.roleIds.map((r) => (
                            <RoleBadge key={r} role={r} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={person.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRegisteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        No se encontraron usuarios que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeMetric === "active" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActiveUsers.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{fullName(person)}</TableCell>
                      <TableCell className="tabular">
                        {formatDocument(person.documentType, person.documentNumber)}
                      </TableCell>
                      <TableCell>{person.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {person.roleIds.map((r) => (
                            <RoleBadge key={r} role={r} />
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredActiveUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        No se encontraron usuarios activos con esa búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeMetric === "courses" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Director de grupo</TableHead>
                    <TableHead>Jornada</TableHead>
                    <TableHead className="text-right">Cupo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((term) => {
                    const course = courseById(data.courses, term.courseId);
                    const grade = course ? gradeById(data.grades, course.gradeId) : null;
                    const director = data.people.find((p) => p.id === term.directorId);
                    return (
                      <TableRow key={term.id}>
                        <TableCell className="font-semibold text-brand-navy">
                          {course?.code}
                        </TableCell>
                        <TableCell>{grade?.name}</TableCell>
                        <TableCell>{director ? fullName(director) : "—"}</TableCell>
                        <TableCell>{term.jornada}</TableCell>
                        <TableCell className="tabular text-right">{term.capacity}</TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredCourses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                        No se encontraron cursos vigentes con esa búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeMetric === "students" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Jornada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map(({ enrollment, student, course, term }) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{fullName(student)}</TableCell>
                      <TableCell className="tabular">
                        {formatDocument(student.documentType, student.documentNumber)}
                      </TableCell>
                      <TableCell className="font-semibold text-brand-navy">
                        {course?.code}
                      </TableCell>
                      <TableCell>{term.jornada}</TableCell>
                    </TableRow>
                  ))}
                  {filteredEnrollments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        No se encontraron estudiantes matriculados con esa búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {activeMetric === "registered" && (
              <Button
                variant="outline"
                className="gap-1.5"
                nativeButton={false}
                render={<Link href="/usuarios" />}
              >
                <span>Ir al módulo de usuarios</span>
                <ArrowRight className="size-4" />
              </Button>
            )}
            {activeMetric === "active" && (
              <Button
                variant="outline"
                className="gap-1.5"
                nativeButton={false}
                render={<Link href="/usuarios" />}
              >
                <span>Ir al módulo de usuarios</span>
                <ArrowRight className="size-4" />
              </Button>
            )}
            {activeMetric === "courses" && (
              <Button
                variant="outline"
                className="gap-1.5"
                nativeButton={false}
                render={<Link href="/academico" />}
              >
                <span>Ir a Estructura académica</span>
                <ArrowRight className="size-4" />
              </Button>
            )}
            {activeMetric === "students" && (
              <Button
                variant="outline"
                className="gap-1.5"
                nativeButton={false}
                render={<Link href="/matriculas" />}
              >
                <span>Ir a Matrículas</span>
                <ArrowRight className="size-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="default"
              onClick={() => setActiveMetric(null)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtitle,
  onClick,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      size="sm"
      className="group relative cursor-pointer border border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy/30 hover:shadow-md ring-1 ring-transparent hover:ring-brand-navy/15 select-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardContent className="flex flex-col justify-between p-4 h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-3xl font-semibold tabular text-brand-navy group-hover:text-brand-navy transition-colors">
              {value}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/80 text-brand-navy transition-all duration-200 group-hover:bg-brand-navy group-hover:text-white group-hover:scale-105 shadow-xs">
            <Icon className="size-5" />
          </div>
        </div>
        {subtitle && (
          <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-medium text-muted-foreground group-hover:text-brand-navy transition-colors">
            <span>{subtitle}</span>
            <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
