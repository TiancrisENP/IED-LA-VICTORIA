"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSession } from "@/providers/session-provider";

export default function TeacherCoursesPage() {
  const { currentUser } = useSession();
  const data = useAppData();
  const currentYear = data.years.find((year) => year.status === "VIGENTE");
  const myAssignments = data.assignments.filter(
    (assignment) => assignment.teacherId === currentUser.id
  );
  const directed = data.courseTerms.filter(
    (term) => term.directorId === currentUser.id && term.yearId === currentYear?.id
  );

  return (
    <div>
      <PageHeader
        title="Mis cursos"
        description={`Consulta de los grupos asignados a ${fullName(currentUser)} en ${currentYear?.year ?? "el año vigente"}.`}
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Mis cursos" }]}
      />

      <div className="grid gap-6">
        {myAssignments.map((assignment) => {
          const term = data.courseTerms.find((item) => item.id === assignment.courseTermId);
          if (!term) return null;
          const students = data.enrollments
            .filter((enrollment) => enrollment.courseTermId === term.id)
            .map((enrollment) => data.students.find((student) => student.id === enrollment.studentId))
            .filter(Boolean);
          return (
            <Card key={assignment.id}>
              <CardHeader>
                <CardTitle>
                  {courseById(data.courses, term.courseId)?.code} · {assignment.subject}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {yearById(data.years, term.yearId)?.year} · {term.jornada} · {students.length}{" "}
                  estudiantes
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Correo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) =>
                      student ? (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{fullName(student)}</TableCell>
                          <TableCell className="tabular">
                            {formatDocument(student.documentType, student.documentNumber)}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                        </TableRow>
                      ) : null
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}

        {directed.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            También es director de{" "}
            {directed
              .map((term) => courseById(data.courses, term.courseId)?.code)
              .join(", ")}
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
