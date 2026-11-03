import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/types";

const styles: Record<UserStatus, string> = {
  ACTIVO: "border-transparent bg-emerald-50 text-emerald-800",
  INACTIVO: "border-transparent bg-slate-100 text-slate-600",
  BLOQUEADO: "border-transparent bg-[#7B1E28]/10 text-[#7B1E28]",
};

export function StatusBadge({ status }: { status: UserStatus }) {
  return <Badge className={styles[status]}>{status}</Badge>;
}
