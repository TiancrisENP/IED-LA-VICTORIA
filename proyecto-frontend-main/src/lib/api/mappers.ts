import type {
  AcademicYear,
  AuditRecord,
  CoexistenceCase,
  Course,
  CourseTerm,
  Enrollment,
  ExcuseRecord,
  GuardianLink,
  Person,
  RolePermissionMatrix,
  Student,
  TeachingAssignment,
  UserStatus,
} from "@/lib/types";

export interface ApiUsuario {
  id: number;
  identificacion: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  estado?: { id: number; nombre: string } | null;
  rol?: { id: number; nombre: string; descripcion?: string | null } | null;
  permisos?: string[];
}

export interface SessionUser {
  id: number;
  authId: string | null;
  identificacion: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  rol: string;
  permisos: string[];
  idRol: number;
  idEstado: number;
}

export function mapUsuarioToPerson(user: ApiUsuario | SessionUser): Person {
  const rol =
    "rol" in user && user.rol && typeof user.rol === "object"
      ? user.rol.nombre
      : (user as SessionUser).rol;
  const estado =
    "estado" in user && user.estado && typeof user.estado === "object"
      ? user.estado.nombre
      : (user as SessionUser).estado;
  return {
    id: String(user.id),
    documentType: "CC",
    documentNumber: user.identificacion,
    firstNames: user.nombre,
    lastNames: user.apellido,
    birthDate: "",
    email: user.email,
    phone: "",
    status: (estado as UserStatus) || "ACTIVO",
    roleIds: [rol as Person["roleIds"][number]],
  };
}

export function peopleToStudents(people: Person[]): Student[] {
  return people
    .filter((person) => person.roleIds.includes("ESTUDIANTE"))
    .map((person) => ({
      id: person.id,
      documentType: person.documentType,
      documentNumber: person.documentNumber,
      firstNames: person.firstNames,
      lastNames: person.lastNames,
      email: person.email,
    }));
}

export function mapCursos(rows: { id: number; grado: string }[]): Course[] {
  return rows.map((row) => ({
    id: String(row.id),
    code: row.grado,
    gradeId: row.grado.split("-")[0] ?? row.grado,
  }));
}

export function mapVigencias(
  rows: { id: number; fechaInicio?: string; fecha_inicio?: string; anio?: string }[],
): AcademicYear[] {
  const current = new Date().getFullYear();
  return rows.map((row) => {
    const start = row.fechaInicio ?? row.fecha_inicio ?? "";
    const year = Number(row.anio ?? String(start).slice(0, 4) ?? row.id);
    return {
      id: String(row.id),
      year,
      label: `Año lectivo ${year}`,
      status: year === current ? "VIGENTE" : "CERRADO",
    };
  });
}

export function termId(cursoId: number | string, vigenciaId: number | string) {
  return `${cursoId}-${vigenciaId}`;
}

export function mapUcvToEnrollment(row: {
  id: number;
  id_curso: number;
  id_vigencia: number;
  id_usuario: number;
}): Enrollment {
  return {
    id: String(row.id),
    studentId: String(row.id_usuario),
    courseTermId: termId(row.id_curso, row.id_vigencia),
  };
}

export function mapUcvToAssignment(row: {
  id: number;
  id_curso: number;
  id_vigencia: number;
  id_usuario: number;
}): TeachingAssignment {
  return {
    id: String(row.id),
    teacherId: String(row.id_usuario),
    courseTermId: termId(row.id_curso, row.id_vigencia),
    subject: "Asignación",
  };
}

export function mapVinculo(row: {
  id: number;
  id_acudiente: number;
  id_estudiante: number;
  parentesco?: string | null;
  es_principal: boolean;
}): GuardianLink {
  return {
    id: String(row.id),
    guardianId: String(row.id_acudiente),
    studentId: String(row.id_estudiante),
    parentesco: (row.parentesco as GuardianLink["parentesco"]) || "Tutor legal",
    esPrincipal: row.es_principal,
  };
}

export function mapAuditoria(row: {
  id: number;
  fecha_hora: string;
  id_usuario: number;
  accion: string;
  entidad: string;
  id_entidad?: number | null;
  detalle?: string | null;
}): AuditRecord {
  return {
    id: String(row.id),
    date: row.fecha_hora,
    userId: String(row.id_usuario),
    action: row.accion,
    entity: row.entidad,
    entityId: String(row.id_entidad ?? ""),
    detalle: row.detalle ?? "",
  };
}

export function mapExcusa(row: {
  id: number;
  radicado: string;
  id_estudiante: number;
  id_usuario_radica: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo_descripcion: string;
  fecha_radicado: string;
  fecha_limite_edicion: string;
  estado_proceso?: { nombre: string } | null;
  motivo_resolucion?: { nombre: string } | null;
  observaciones_revision?: string | null;
  id_usuario_reviso?: number | null;
  fecha_revision?: string | null;
}): ExcuseRecord {
  return {
    id: String(row.id),
    radicado: row.radicado,
    studentId: String(row.id_estudiante),
    filedById: String(row.id_usuario_radica),
    startDate: row.fecha_inicio,
    endDate: row.fecha_fin,
    motive: row.motivo_descripcion,
    filedAt: row.fecha_radicado,
    editDeadline: row.fecha_limite_edicion,
    processStatus: row.estado_proceso?.nombre ?? "",
    resolutionMotive: row.motivo_resolucion?.nombre,
    reviewNotes: row.observaciones_revision ?? undefined,
    reviewedById: row.id_usuario_reviso ? String(row.id_usuario_reviso) : undefined,
    reviewedAt: row.fecha_revision ?? undefined,
  };
}

export function mapConvivencia(row: {
  id: number;
  id_estudiante: number;
  fecha_hora: string;
  lugar?: string | null;
  descripcion_objetiva: string;
  clasificacion?: { nombre: string } | null;
  estado_proceso?: { nombre: string } | null;
  id_usuario_creo: number;
}): CoexistenceCase {
  return {
    id: String(row.id),
    studentId: String(row.id_estudiante),
    date: row.fecha_hora,
    place: row.lugar ?? "",
    description: row.descripcion_objetiva,
    classification: row.clasificacion?.nombre ?? "",
    processStatus: row.estado_proceso?.nombre ?? "",
    createdById: String(row.id_usuario_creo),
  };
}

export function buildMatrix(
  roles: { nombre: string; permisos: { codigo: string }[] }[],
): RolePermissionMatrix {
  const matrix = {
    ADMINISTRADOR: [],
    RECTOR: [],
    COORDINADOR: [],
    DOCENTE: [],
    PSICORIENTADOR: [],
    ESTUDIANTE: [],
    ACUDIENTE: [],
  } as RolePermissionMatrix;
  for (const role of roles) {
    const key = role.nombre as keyof RolePermissionMatrix;
    if (key in matrix) {
      matrix[key] = role.permisos.map((item) => item.codigo);
    }
  }
  return matrix;
}

export function termsFromLinks(
  enrollments: Enrollment[],
  assignments: TeachingAssignment[],
  courses: Course[],
  years: AcademicYear[],
): CourseTerm[] {
  const keys = new Set(
    [...enrollments, ...assignments].map((item) =>
      "courseTermId" in item ? item.courseTermId : "",
    ),
  );
  return Array.from(keys).map((id) => {
    const [courseId, yearId] = id.split("-");
    return {
      id,
      courseId: courses.find((course) => course.id === courseId)?.id ?? courseId,
      yearId: years.find((year) => year.id === yearId)?.id ?? yearId,
      directorId: assignments.find((item) => item.courseTermId === id)?.teacherId ?? "",
      jornada: "MAÑANA",
      capacity: 40,
    };
  });
}
