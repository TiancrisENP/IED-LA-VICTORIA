"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDocument, fullName } from "@/lib/format";
import { courseById, personById, yearById } from "@/lib/lookups";
import { useAppData } from "@/providers/data-provider";
import { useSession } from "@/providers/session-provider";

export default function WardsPage() {
  const { currentUser } = useSession();
  const data = useAppData();
  const myLinks = data.links.filter((link) => link.guardianId === currentUser.id);

  return (
    <div>
      <PageHeader
        title="Mis acudidos"
        description="Información académica de los estudiantes vinculados a su cuenta."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Mis acudidos" }]}
      />

      {myLinks.length === 0 ? (
        <EmptyState
          title="Sin acudidos"
          description="Esta cuenta de acudiente no tiene estudiantes vinculados en el prototipo."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myLinks.map((link) => {
            const student = data.students.find((item) => item.id === link.studentId);
            if (!student) return null;
            const enrollment = data.enrollments.find((item) => item.studentId === student.id);
            const term = data.courseTerms.find((item) => item.id === enrollment?.courseTermId);
            const director = term ? personById(data.people, term.directorId) : undefined;
            return (
              <Card key={link.id}>
                <CardHeader>
                  <CardTitle>{fullName(student)}</CardTitle>
                  <p className="text-sm text-muted-foreground">{link.parentesco}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Documento: </span>
                    {formatDocument(student.documentType, student.documentNumber)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Correo: </span>
                    {student.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Curso: </span>
                    {term
                      ? `${courseById(data.courses, term.courseId)?.code} · ${yearById(data.years, term.yearId)?.year} · ${term.jornada}`
                      : "Sin matrícula vigente"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Director de grupo: </span>
                    {director ? fullName(director) : "—"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
