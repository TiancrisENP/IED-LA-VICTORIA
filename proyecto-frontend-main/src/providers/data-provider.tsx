"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  academicoApi,
  asignacionesApi,
  auditoriaApi,
  convivenciaApi,
  excusasApi,
  matriculasApi,
  rolesApi,
  usuariosApi,
  vinculosApi,
} from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { ApiPermiso, ApiRol } from "@/lib/api/roles";
import {
  buildMatrix,
  mapAuditoria,
  mapConvivencia,
  mapCursos,
  mapExcusa,
  mapUcvToAssignment,
  mapUcvToEnrollment,
  mapUsuarioToPerson,
  mapVigencias,
  mapVinculo,
  peopleToStudents,
  termsFromLinks,
} from "@/lib/api/mappers";
import type {
  AcademicYear,
  AuditRecord,
  CoexistenceCase,
  Course,
  CourseTerm,
  Enrollment,
  ExcuseRecord,
  Grade,
  GuardianLink,
  Person,
  RolePermissionMatrix,
  TeachingAssignment,
} from "@/lib/types";
import { useSession } from "@/providers/session-provider";

interface DataContextValue {
  people: Person[];
  students: ReturnType<typeof peopleToStudents>;
  years: AcademicYear[];
  grades: Grade[];
  courses: Course[];
  courseTerms: CourseTerm[];
  enrollments: Enrollment[];
  assignments: TeachingAssignment[];
  links: GuardianLink[];
  audit: AuditRecord[];
  excuses: ExcuseRecord[];
  coexistenceCases: CoexistenceCase[];
  matrix: RolePermissionMatrix;
  catalogRoles: ApiRol[];
  catalogPermisos: ApiPermiso[];
  loading: boolean;
  refresh: () => Promise<void>;
  upsertPerson: (
    person: Person,
    credentials?: { usuario: string; contrasena?: string },
  ) => Promise<void>;
  togglePersonStatus: (id: string) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  addAssignment: (assignment: TeachingAssignment) => void;
  addLink: (link: GuardianLink) => void;
  upsertYear: (year: AcademicYear) => void;
  upsertGrade: (grade: Grade) => void;
  upsertCourse: (course: Course) => void;
  upsertTerm: (term: CourseTerm) => void;
  setPermission: (role: keyof RolePermissionMatrix, permissionId: string, enabled: boolean) => void;
}

const emptyMatrix: RolePermissionMatrix = {
  ADMINISTRADOR: [],
  RECTOR: [],
  COORDINADOR: [],
  DOCENTE: [],
  PSICORIENTADOR: [],
  ESTUDIANTE: [],
  ACUDIENTE: [],
};

const DataContext = createContext<DataContextValue | null>(null);

function uniqueGrades(courses: Course[]): Grade[] {
  const seen = new Map<string, Grade>();
  for (const course of courses) {
    if (!seen.has(course.gradeId)) {
      seen.set(course.gradeId, {
        id: course.gradeId,
        name: `${course.gradeId}°`,
        level: Number(course.gradeId) || 0,
      });
    }
  }
  return Array.from(seen.values());
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [excuses, setExcuses] = useState<ExcuseRecord[]>([]);
  const [coexistenceCases, setCoexistenceCases] = useState<CoexistenceCase[]>([]);
  const [matrix, setMatrix] = useState<RolePermissionMatrix>(emptyMatrix);
  const [catalogRoles, setCatalogRoles] = useState<ApiRol[]>([]);
  const [catalogPermisos, setCatalogPermisos] = useState<ApiPermiso[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [
        usuarios,
        cursos,
        vigencias,
        matriculas,
        asignaciones,
        vinculos,
        auditoria,
        roles,
        permisos,
        excusas,
        convivencia,
      ] = await Promise.all([
        usuariosApi.list({ limit: 100 }),
        academicoApi.cursos(),
        academicoApi.vigencias(),
        matriculasApi.list().catch(() => ({ data: [] })),
        asignacionesApi.list().catch(() => ({ data: [] })),
        vinculosApi.list().catch(() => ({ data: [] })),
        auditoriaApi.list().catch(() => ({ data: [] })),
        rolesApi.list().catch(() => []),
        rolesApi.permisos().catch(() => []),
        excusasApi.list().catch(() => ({ data: [] })),
        convivenciaApi.list().catch(() => ({ data: [] })),
      ]);

      const nextPeople = usuarios.data.map(mapUsuarioToPerson);
      const nextCourses = mapCursos(cursos);
      const nextYears = mapVigencias(vigencias);
      const nextEnrollments = (matriculas.data ?? []).map(mapUcvToEnrollment);
      const nextAssignments = (asignaciones.data ?? []).map(mapUcvToAssignment);

      setPeople(nextPeople);
      setCourses(nextCourses);
      setYears(nextYears);
      setEnrollments(nextEnrollments);
      setAssignments(nextAssignments);
      setLinks((vinculos.data ?? []).map(mapVinculo));
      setAudit((auditoria.data ?? []).map(mapAuditoria));
      setCatalogRoles(roles);
      setCatalogPermisos(permisos);
      setMatrix(buildMatrix(roles));
      setExcuses((excusas.data ?? []).map(mapExcusa));
      setCoexistenceCases((convivencia.data ?? []).map(mapConvivencia));
    } catch (error) {
      toast.error("No se pudo cargar el directorio", {
        description: error instanceof ApiError ? error.message : "Revise la API",
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const grades = useMemo(() => uniqueGrades(courses), [courses]);
  const courseTerms = useMemo(
    () => termsFromLinks(enrollments, assignments, courses, years),
    [enrollments, assignments, courses, years],
  );
  const students = useMemo(() => peopleToStudents(people), [people]);

  const upsertPerson = useCallback(
    async (person: Person, credentials?: { usuario: string; contrasena?: string }) => {
      const roleName = person.roleIds[0];
      const role = catalogRoles.find((item) => item.nombre === roleName);
      const estado = person.status === "INACTIVO" ? "INACTIVO" : person.status === "BLOQUEADO" ? "BLOQUEADO" : "ACTIVO";
      const estadoId =
        estado === "ACTIVO" ? 1 : estado === "INACTIVO" ? 2 : 3;
      if (person.id && !person.id.startsWith("u-")) {
        await usuariosApi.update(Number(person.id), {
          identificacion: person.documentNumber,
          nombre: person.firstNames,
          apellido: person.lastNames,
          email: person.email,
          idRol: role?.id,
          idEstado: estadoId,
          usuario: credentials?.usuario,
          contrasena: credentials?.contrasena,
        });
      } else {
        if (!credentials?.contrasena) {
          throw new Error("La contraseña es obligatoria al crear un usuario.");
        }
        await usuariosApi.create({
          identificacion: person.documentNumber,
          usuario: credentials?.usuario ?? person.email.split("@")[0],
          contrasena: credentials.contrasena,
          nombre: person.firstNames,
          apellido: person.lastNames,
          email: person.email,
          idRol: role?.id ?? catalogRoles.find((item) => item.nombre === "ESTUDIANTE")?.id,
        });
      }
      await refresh();
    },
    [catalogRoles, refresh],
  );

  const togglePersonStatus = useCallback(
    (id: string) => {
      const person = people.find((item) => item.id === id);
      if (!person) return;
      const next = person.status === "ACTIVO" ? 2 : 1;
      void usuariosApi
        .update(Number(id), { idEstado: next })
        .then(() => refresh())
        .catch((error: unknown) =>
          toast.error("No se pudo cambiar el estado", {
            description: error instanceof Error ? error.message : undefined,
          }),
        );
    },
    [people, refresh],
  );

  const addEnrollment = useCallback(
    (enrollment: Enrollment) => {
      const [cursoId, vigenciaId] = enrollment.courseTermId.split("-");
      void matriculasApi
        .create({
          idCurso: Number(cursoId),
          idVigencia: Number(vigenciaId),
          idUsuario: Number(enrollment.studentId),
        })
        .then(() => refresh())
        .catch((error: unknown) =>
          toast.error("No se pudo matricular", {
            description: error instanceof Error ? error.message : undefined,
          }),
        );
    },
    [refresh],
  );

  const addAssignment = useCallback(
    (assignment: TeachingAssignment) => {
      const [cursoId, vigenciaId] = assignment.courseTermId.split("-");
      void asignacionesApi
        .create({
          idCurso: Number(cursoId),
          idVigencia: Number(vigenciaId),
          idUsuario: Number(assignment.teacherId),
        })
        .then(() => refresh())
        .catch((error: unknown) =>
          toast.error("No se pudo asignar", {
            description: error instanceof Error ? error.message : undefined,
          }),
        );
    },
    [refresh],
  );

  const addLink = useCallback(
    (link: GuardianLink) => {
      void vinculosApi
        .create({
          idAcudiente: Number(link.guardianId),
          idEstudiante: Number(link.studentId),
          parentesco: link.parentesco,
          esPrincipal: link.esPrincipal,
        })
        .then(() => refresh())
        .catch((error: unknown) =>
          toast.error("No se pudo crear el vínculo", {
            description: error instanceof Error ? error.message : undefined,
          }),
        );
    },
    [refresh],
  );

  const upsertYear = useCallback(
    (year: AcademicYear) => {
      void academicoApi
        .createVigencia(`${year.year}-01-20`, `${year.year}-11-28`, Number(year.id) || year.year)
        .then(() => refresh())
        .catch((error: unknown) =>
          toast.error("No se pudo guardar la vigencia", {
            description: error instanceof Error ? error.message : undefined,
          }),
        );
    },
    [refresh],
  );

  const upsertGrade = useCallback((_grade: Grade) => {
    // El modelo SQL no tiene tabla de grado; el grado vive en curso.grado.
  }, []);

  const upsertCourse = useCallback(
    (course: Course) => {
      void academicoApi
        .createCurso(course.code)
        .then(() => refresh())
        .catch((error: unknown) =>
          toast.error("No se pudo guardar el curso", {
            description: error instanceof Error ? error.message : undefined,
          }),
        );
    },
    [refresh],
  );

  const upsertTerm = useCallback((_term: CourseTerm) => {
    // Las vigencias de curso se materializan al matricular o asignar.
  }, []);

  const setPermission = useCallback(
    (role: keyof RolePermissionMatrix, permissionId: string, enabled: boolean) => {
      const apiRole = catalogRoles.find((item) => item.nombre === role);
      const permiso = catalogPermisos.find((item) => item.codigo === permissionId);
      if (!apiRole || !permiso) return;
      const currentIds = apiRole.permisos.map((item) => item.id);
      const nextIds = enabled
        ? Array.from(new Set([...currentIds, permiso.id]))
        : currentIds.filter((id) => id !== permiso.id);
      void rolesApi
        .updatePermisos(apiRole.id, nextIds)
        .then(() => refresh())
        .catch((error: unknown) =>
          toast.error("No se pudo actualizar el permiso", {
            description: error instanceof Error ? error.message : undefined,
          }),
        );
    },
    [catalogRoles, catalogPermisos, refresh],
  );

  const value = useMemo(
    () => ({
      people,
      students,
      years,
      grades,
      courses,
      courseTerms,
      enrollments,
      assignments,
      links,
      audit,
      excuses,
      coexistenceCases,
      matrix,
      catalogRoles,
      catalogPermisos,
      loading,
      refresh,
      upsertPerson,
      togglePersonStatus,
      addEnrollment,
      addAssignment,
      addLink,
      upsertYear,
      upsertGrade,
      upsertCourse,
      upsertTerm,
      setPermission,
    }),
    [
      people,
      students,
      years,
      grades,
      courses,
      courseTerms,
      enrollments,
      assignments,
      links,
      audit,
      excuses,
      coexistenceCases,
      matrix,
      catalogRoles,
      catalogPermisos,
      loading,
      refresh,
      upsertPerson,
      togglePersonStatus,
      addEnrollment,
      addAssignment,
      addLink,
      upsertYear,
      upsertGrade,
      upsertCourse,
      upsertTerm,
      setPermission,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useAppData must be used within DataProvider");
  }
  return context;
}
