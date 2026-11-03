import { api } from "./client";

export const academicoApi = {
  cursos() {
    return api<{ id: number; grado: string }[]>("/cursos");
  },
  createCurso(grado: string) {
    return api("/cursos", { method: "POST", body: JSON.stringify({ grado }) });
  },
  vigencias() {
    return api<{ id: number; fecha_inicio?: string; fechaInicio?: string; anio?: string }[]>(
      "/vigencias",
    );
  },
  createVigencia(fechaInicio: string, fechaFin: string, id?: number) {
    return api("/vigencias", {
      method: "POST",
      body: JSON.stringify({ fechaInicio, fechaFin, id }),
    });
  },
};

export const matriculasApi = {
  list() {
    return api<{ data: any[] }>("/matriculas?limit=100");
  },
  create(body: { idCurso: number; idVigencia: number; idUsuario: number }) {
    return api("/matriculas", { method: "POST", body: JSON.stringify(body) });
  },
};

export const asignacionesApi = {
  list() {
    return api<{ data: any[] }>("/asignaciones?limit=100");
  },
  create(body: { idCurso: number; idVigencia: number; idUsuario: number }) {
    return api("/asignaciones", { method: "POST", body: JSON.stringify(body) });
  },
  misCursos() {
    return api("/mis-cursos");
  },
};

export const vinculosApi = {
  list() {
    return api<{ data: any[] }>("/vinculos?limit=100");
  },
  create(body: {
    idAcudiente: number;
    idEstudiante: number;
    parentesco?: string;
    esPrincipal?: boolean;
  }) {
    return api("/vinculos", { method: "POST", body: JSON.stringify(body) });
  },
  acudidos() {
    return api("/acudidos");
  },
};

export const excusasApi = {
  list() {
    return api<{ data: any[] }>("/excusas?limit=100");
  },
};

export const convivenciaApi = {
  list() {
    return api<{ data: any[] }>("/convivencia?limit=100");
  },
};

export const auditoriaApi = {
  list() {
    return api<{ data: any[] }>("/auditoria?limit=50");
  },
};

export const dashboardApi = {
  stats() {
    return api<{
      usuariosActivos: number;
      excusasPendientes: number;
      convivenciaAbierta: number;
      matriculas: number;
    }>("/dashboard/stats");
  },
};
