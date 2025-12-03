import useAuthStore from "@/stores/auth"
import { useQuery } from "@tanstack/react-query"

export default function useAutoLogin() {
  const { autologin } = useAuthStore();

  useQuery({
    queryKey: ['autologin'],
    queryFn: () => autologin(),
  });
}