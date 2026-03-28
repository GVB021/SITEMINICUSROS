import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { useAuth } from "@/hooks/use-auth";

export type StudioRole = "MASTER" | "ADMINISTRADOR" | "DIRETOR" | "DUBLADOR" | "ALUNO" | null;

const ROLE_HIERARCHY: Record<string, number> = {
  MASTER: 100,
  ADMINISTRADOR: 80,
  DIRETOR: 60,
  DUBLADOR: 40,
  ALUNO: 20,
};

export function useStudioRole(studioId: string) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<{ role: string | null; roles: string[] }>({
    queryKey: ["/api/studios", studioId, "my-role"],
    queryFn: () => authFetch(`/api/studios/${studioId}/my-role`),
    enabled: !!studioId && !!user,
    staleTime: 60000,
  });

  const roles: string[] = user?.role === "MASTER"
    ? ["MASTER"]
    : (data?.roles?.length ? data.roles : (data?.role ? [data.role] : []));

  const role: StudioRole = user?.role === "MASTER"
    ? "MASTER"
    : (data?.role as StudioRole) || null;

  const hasMinRole = (minRole: string): boolean => {
    if (roles.length === 0) return false;
    return roles.some(r => (ROLE_HIERARCHY[r] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 999));
  };

  const hasRole = (targetRole: string): boolean => {
    return roles.includes(targetRole);
  };

  return {
    role,
    roles,
    isLoading: isLoading && user?.role !== "MASTER",
    canManageMembers: hasMinRole("ADMINISTRADOR"),
    canCreateProductions: hasMinRole("ADMINISTRADOR"),
    canCreateSessions: hasMinRole("DIRETOR"),
    canEditScripts: hasMinRole("ADMINISTRADOR"),
    canManageStaff: hasMinRole("ADMINISTRADOR"),
    canViewStaff: hasMinRole("DIRETOR"),
    hasMinRole,
    hasRole,
  };
}
