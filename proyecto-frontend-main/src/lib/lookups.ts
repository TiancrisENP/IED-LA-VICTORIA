import type {
  AcademicYear,
  Course,
  CourseTerm,
  Grade,
  Person,
  Student,
} from "@/lib/types";
import { fullName } from "@/lib/format";

export function personById(people: Person[], id: string) {
  return people.find((person) => person.id === id);
}

export function studentById(students: Student[], id: string) {
  return students.find((student) => student.id === id);
}

export function yearById(years: AcademicYear[], id: string) {
  return years.find((year) => year.id === id);
}

export function courseById(courses: Course[], id: string) {
  return courses.find((course) => course.id === id);
}

export function gradeById(grades: Grade[], id: string) {
  return grades.find((grade) => grade.id === id);
}

export function termLabel(
  term: CourseTerm,
  courses: Course[],
  years: AcademicYear[]
) {
  const course = courseById(courses, term.courseId);
  const year = yearById(years, term.yearId);
  return `${course?.code ?? "Curso"} · ${year?.year ?? "—"}`;
}

export function teacherName(people: Person[], id: string) {
  const person = personById(people, id);
  return person ? fullName(person) : "Sin asignar";
}
