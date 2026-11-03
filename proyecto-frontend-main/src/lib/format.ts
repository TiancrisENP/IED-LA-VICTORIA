import type { Person, Student } from "@/lib/types";

export function fullName(person: Pick<Person | Student, "firstNames" | "lastNames">) {
  return `${person.firstNames} ${person.lastNames}`;
}

export function initials(person: Pick<Person | Student, "firstNames" | "lastNames">) {
  const first = person.firstNames.trim().charAt(0);
  const last = person.lastNames.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function formatDocument(type: string, number: string) {
  return `${type} ${number}`;
}

export function usernameOf(email: string) {
  return email.split("@")[0] ?? "";
}

export function formatDateTime(iso: string) {
  const [date, time] = iso.split("T");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function formatDate(iso: string) {
  const [date] = iso.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export function formatPhone(phone: string) {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
}
