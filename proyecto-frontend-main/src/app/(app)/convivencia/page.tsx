"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fullName } from "@/lib/format";
import { personById, studentById } from "@/lib/lookups";
import { useAppData } from "@/providers/data-provider";

function statusClass(status: string) {
  if (status === "Aprobada") return "bg-emerald-50 text-emerald-800";
  if (status === "En revisión") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export default function CoexistencePage() {
  const { people, students, coexistenceCases } = useAppData();

  return (
    <div>
      <PageHeader
        title="Convivencia"
        description="Tabla situacion_convivencia: estudiante, fecha, lugar, descripción objetiva, clasificación y estado de proceso."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Convivencia" }]}
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Lugar</TableHead>
                <TableHead>Descripción objetiva</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Reportante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coexistenceCases.map((item) => {
                const student = studentById(students, item.studentId);
                const reporter = personById(people, item.createdById);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {student ? fullName(student) : item.studentId}
                    </TableCell>
                    <TableCell className="tabular">{item.date}</TableCell>
                    <TableCell>{item.place}</TableCell>
                    <TableCell className="max-w-sm text-sm">{item.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.classification}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass(item.processStatus)}>
                        {item.processStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {reporter ? fullName(reporter) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
