export type RoleCode =
  | "ADMINISTRADOR"
  | "RECTOR"
  | "COORDINADOR"
  | "DOCENTE"
  | "PSICORIENTADOR"
  | "ESTUDIANTE"
  | "ACUDIENTE";

export type UserStatus = "ACTIVO" | "INACTIVO" | "BLOQUEADO";

export type DocumentType = "CC" | "TI" | "CE" | "PASAPORTE";

export type Jornada = "MAÑANA" | "TARDE";

export type Parentesco =
  | "Madre"
  | "Padre"
  | "Abuela"
  | "Abuelo"
  | "Tío"
  | "Tía"
  | "Hermano"
  | "Tutor legal";

export interface Role {
  id: RoleCode;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  module: string;
  label: string;
  description: string;
}

export interface Person {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  birthDate: string;
  email: string;
  phone: string;
  status: UserStatus;
  roleIds: RoleCode[];
}

export interface AcademicYear {
  id: string;
  year: number;
  label: string;
  status: "VIGENTE" | "CERRADO";
}

export interface Grade {
  id: string;
  name: string;
  level: number;
}

export interface Course {
  id: string;
  code: string;
  gradeId: string;
}

export interface CourseTerm {
  id: string;
  courseId: string;
  yearId: string;
  directorId: string;
  jornada: Jornada;
  capacity: number;
}

export interface Student {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  email: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseTermId: string;
}

export interface TeachingAssignment {
  id: string;
  teacherId: string;
  courseTermId: string;
  subject: string;
}

export interface GuardianLink {
  id: string;
  guardianId: string;
  studentId: string;
  parentesco: Parentesco;
  esPrincipal?: boolean;
}

export interface AuditRecord {
  id: string;
  date: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  ip?: string;
  detalle?: string;
}

export interface ExcuseRecord {
  id: string;
  radicado: string;
  studentId: string;
  filedById: string;
  startDate: string;
  endDate: string;
  motive: string;
  filedAt: string;
  editDeadline: string;
  processStatus: string;
  resolutionMotive?: string;
  reviewNotes?: string;
  reviewedById?: string;
  reviewedAt?: string;
}

export interface CoexistenceCase {
  id: string;
  studentId: string;
  date: string;
  place: string;
  description: string;
  classification: string;
  processStatus: string;
  createdById: string;
}

export type RolePermissionMatrix = Record<RoleCode, string[]>;
