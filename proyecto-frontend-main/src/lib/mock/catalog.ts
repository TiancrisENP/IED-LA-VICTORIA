import type {
  AcademicYear,
  Course,
  Grade,
  Permission,
  Role,
  RolePermissionMatrix,
} from "@/lib/types";

export const roles: Role[] = [
  {
    id: "ADMINISTRADOR",
    name: "Administrador",
    description:
      "Gestiona usuarios, roles, carga masiva y la bitácora de auditoría.",
  },
  {
    id: "RECTOR",
    name: "Rector",
    description:
      "Consulta la comunidad educativa, la estructura académica y la auditoría.",
  },
  {
    id: "COORDINADOR",
    name: "Coordinador",
    description:
      "Administra cursos, matrículas y asignaciones docentes del año lectivo.",
  },
  {
    id: "DOCENTE",
    name: "Docente",
    description: "Consulta los cursos a cargo y el listado de estudiantes.",
  },
  {
    id: "PSICORIENTADOR",
    name: "Psicorientador",
    description:
      "Consulta información de estudiantes para acompañamiento psicosocial.",
  },
  {
    id: "ACUDIENTE",
    name: "Acudiente",
    description: "Consulta la información académica de sus acudidos.",
  },
];

export const permissions: Permission[] = [
  {
    id: "usuario.ver",
    module: "Usuarios",
    label: "Consultar usuarios",
    description: "Ver el directorio de personas y sus roles.",
  },
  {
    id: "usuario.crear",
    module: "Usuarios",
    label: "Crear usuarios",
    description: "Registrar una persona nueva en el sistema.",
  },
  {
    id: "usuario.editar",
    module: "Usuarios",
    label: "Editar usuarios",
    description: "Actualizar datos personales y estado.",
  },
  {
    id: "rol.asignar",
    module: "Roles",
    label: "Asignar roles",
    description: "Otorgar o retirar roles a una persona.",
  },
  {
    id: "rol.ver",
    module: "Roles",
    label: "Ver matriz de permisos",
    description: "Consultar qué puede hacer cada rol.",
  },
  {
    id: "carga.csv",
    module: "Usuarios",
    label: "Carga masiva CSV",
    description: "Importar personas y matrículas desde un archivo.",
  },
  {
    id: "academico.ver",
    module: "Académico",
    label: "Consultar estructura",
    description: "Ver años, grados, cursos y vigencias.",
  },
  {
    id: "academico.gestionar",
    module: "Académico",
    label: "Gestionar estructura",
    description: "Crear o editar años, cursos y vigencias.",
  },
  {
    id: "matricula.ver",
    module: "Matrículas",
    label: "Consultar matrículas",
    description: "Ver estudiantes matriculados por curso.",
  },
  {
    id: "matricula.crear",
    module: "Matrículas",
    label: "Matricular estudiantes",
    description: "Inscribir un estudiante en una vigencia de curso.",
  },
  {
    id: "asignacion.ver",
    module: "Asignaciones",
    label: "Consultar asignaciones",
    description: "Ver docentes a cargo de cada curso.",
  },
  {
    id: "asignacion.crear",
    module: "Asignaciones",
    label: "Asignar docentes",
    description: "Relacionar un docente con una vigencia de curso.",
  },
  {
    id: "vinculo.ver",
    module: "Vínculos",
    label: "Consultar vínculos",
    description: "Ver relaciones acudiente–estudiante.",
  },
  {
    id: "vinculo.crear",
    module: "Vínculos",
    label: "Crear vínculos",
    description: "Registrar un parentesco entre acudiente y estudiante.",
  },
  {
    id: "auditoria.ver",
    module: "Auditoría",
    label: "Ver bitácora",
    description: "Consultar el registro de acciones del sistema.",
  },
];

export const rolePermissions: RolePermissionMatrix = {
  ADMINISTRADOR: permissions.map((permission) => permission.id),
  ESTUDIANTE: ["excusa.ver", "excusa.radicar"],
  RECTOR: [
    "usuario.ver",
    "rol.ver",
    "academico.ver",
    "matricula.ver",
    "asignacion.ver",
    "vinculo.ver",
    "auditoria.ver",
  ],
  COORDINADOR: [
    "usuario.ver",
    "academico.ver",
    "academico.gestionar",
    "matricula.ver",
    "matricula.crear",
    "asignacion.ver",
    "asignacion.crear",
    "vinculo.ver",
    "auditoria.ver",
  ],
  DOCENTE: ["academico.ver", "matricula.ver"],
  PSICORIENTADOR: ["usuario.ver", "matricula.ver", "vinculo.ver"],
  ACUDIENTE: ["vinculo.ver"],
};

export const academicYears: AcademicYear[] = [
  { id: "year-2025", year: 2025, label: "Año lectivo 2025", status: "CERRADO" },
  { id: "year-2026", year: 2026, label: "Año lectivo 2026", status: "VIGENTE" },
];

export const grades: Grade[] = [
  { id: "g6", name: "6°", level: 6 },
  { id: "g7", name: "7°", level: 7 },
  { id: "g8", name: "8°", level: 8 },
  { id: "g9", name: "9°", level: 9 },
  { id: "g10", name: "10°", level: 10 },
  { id: "g11", name: "11°", level: 11 },
];

export const courses: Course[] = [
  { id: "c-601", code: "6-01", gradeId: "g6" },
  { id: "c-602", code: "6-02", gradeId: "g6" },
  { id: "c-701", code: "7-01", gradeId: "g7" },
  { id: "c-702", code: "7-02", gradeId: "g7" },
  { id: "c-801", code: "8-01", gradeId: "g8" },
  { id: "c-901", code: "9-01", gradeId: "g9" },
  { id: "c-1001", code: "10-01", gradeId: "g10" },
  { id: "c-1002", code: "10-02", gradeId: "g10" },
  { id: "c-1101", code: "11-01", gradeId: "g11" },
  { id: "c-1102", code: "11-02", gradeId: "g11" },
];
