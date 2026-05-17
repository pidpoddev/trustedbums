import { useAuth } from "@/contexts/AuthContext";
import { getBrowserTimeZone } from "@/lib/timezone";

export function useUserTimeZone() {
  const { user } = useAuth();
  return user?.timeZone ?? getBrowserTimeZone();
}
