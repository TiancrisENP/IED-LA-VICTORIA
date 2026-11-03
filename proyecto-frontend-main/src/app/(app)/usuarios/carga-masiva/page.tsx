"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { studentEmail } from "@/lib/tenant";
import { usuariosApi } from "@/lib/api";
import { useSession } from "@/providers/session-provider";
import { useTenant } from "@/providers/tenant-provider";

export default function BulkUploadPage() {
  const { tenant } = useTenant();
  const { session } = useSession();
  const canUpload = (session?.permisos ?? []).includes("carga.csv");
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<
    { line: number; ok: boolean; data: string; reason: string }[] | null
  >(null);
  const template = `Año,idCurso,Usuario,Identificación,Apellidos,Nombres,E-Mail\n2026,6-01,maguilar,1090123456,Aguilar Ríos,Mariana,${studentEmail("mariana.aguilar", tenant)}\n`;

  async function loadFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo supera 2 MB");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Solo se aceptan archivos CSV");
      return;
    }
    setFileName(file.name);
    try {
      const result = await usuariosApi.cargaMasiva(file);
      setRows(result.filas as { line: number; ok: boolean; data: string; reason: string }[]);
      toast.message("Archivo procesado", {
        description: `${result.ok} filas ok, ${result.errores} con error.`,
      });
    } catch (error) {
      toast.error("No se pudo importar", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  function downloadTemplate() {
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla-carga-usuarios.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Plantilla descargada");
  }

  const valid = rows?.filter((row) => row.ok).length ?? 0;
  const invalid = rows?.filter((row) => !row.ok).length ?? 0;

  if (!canUpload) {
    return (
      <EmptyState
        title="Sin permiso"
        description="La carga masiva CSV requiere el permiso carga.csv."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Carga masiva"
        description="Importe estudiantes y matrículas desde un CSV. El backend valida cada fila y crea usuarios ESTUDIANTE."
        crumbs={[
          { href: "/", label: "Inicio" },
          { href: "/usuarios", label: "Usuarios" },
          { label: "Carga masiva" },
        ]}
        actions={
          <Button variant="outline" className="h-9" onClick={downloadTemplate}>
            <Download />
            Descargar plantilla
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Archivo CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void loadFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void loadFile(file);
            }}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center ${
              dragging ? "border-brand-blue bg-secondary" : "border-border bg-muted/30"
            }`}
          >
            <FileSpreadsheet className="size-8 text-brand-blue" />
            <p className="text-sm font-medium">Arrastre el archivo o selecciónelo</p>
            <p className="text-xs text-muted-foreground">
              Encabezado: Año, idCurso, Usuario, Identificación, Apellidos, Nombres, E-Mail
            </p>
            {fileName ? (
              <p className="text-xs text-brand-navy">{fileName}</p>
            ) : null}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Resultado de validación</CardTitle>
          {rows ? (
            <div className="flex gap-2">
              <Badge className="bg-emerald-50 text-emerald-800">{valid} válidas</Badge>
              <Badge className="bg-[#7B1E28]/10 text-[#7B1E28]">{invalid} con error</Badge>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          {!rows ? (
            <EmptyState
              title="Aún no hay resultados"
              description="Cargue un CSV para validar e importar fila por fila."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Línea</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.line}>
                    <TableCell className="tabular">{row.line}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          row.ok
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-[#7B1E28]/10 text-[#7B1E28]"
                        }
                      >
                        {row.ok ? "Válida" : "Error"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate font-mono text-xs">
                      {row.data}
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {row.reason}
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
