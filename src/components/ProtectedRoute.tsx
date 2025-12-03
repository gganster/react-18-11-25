import useAuthStore from "@/stores/auth";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({children} : {children: React.ReactNode}) => {
  const { user } = useAuthStore();

  return (
    <>
      {user ? children : <Navigate to="/login" />}
    </>
  )
}