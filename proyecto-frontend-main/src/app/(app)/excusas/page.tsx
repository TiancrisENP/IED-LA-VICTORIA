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
import { formatDateTime, fullName } from "@/lib/format";
import { personById, studentById } from "@/lib/lookups";
import { useAppData } from "@/providers/data-provider";

function statusClass(status: string) {
  if (status === "Aprobada") return "bg-emerald-50 text-emerald-800";
  if (status === "Rechazada") return "bg-brand-wine/10 text-brand-wine";
  if (status === "En revisión") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export default function ExcusesPage() {
  const { people, students, excuses } = useAppData();

  return (
    <div>
      <PageHeader
        title="Excusas"
        description="Tabla excusa: radicado, estudiante, fechas, motivo, estado de proceso y motivo de resolución."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Excusas" }]}
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Radicado</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Resolución</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {excuses.map((item) => {
                const student = studentById(students, item.studentId);
                const reviewer = item.reviewedById
                  ? personById(people, item.reviewedById)
                  : undefined;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.radicado}</TableCell>
                    <TableCell className="font-medium">
                      {student ? fullName(student) : item.studentId}
                    </TableCell>
                    <TableCell className="tabular text-sm">
                      {item.startDate} → {item.endDate}
                      <span className="block text-xs text-muted-foreground">
                        Radicada {formatDateTime(item.filedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm">{item.motive}</TableCell>
                    <TableCell>
                      <Badge className={statusClass(item.processStatus)}>
                        {item.processStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.resolutionMotive ?? "—"}
                      {reviewer ? (
                        <span className="block text-xs text-muted-foreground">
                          {fullName(reviewer)}
                        </span>
                      ) : null}
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
