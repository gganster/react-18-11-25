import { ErrorBoundaryTester } from "@/components/ErrorBoundaryTester"
import { SuspenseBoundaryTester } from "@/components/SuspenseBoundaryTester"
import { Button } from "@/components/ui/button"
import useAuthStore from "@/stores/auth"

function DashboardHome() {
  const { logout } = useAuthStore();
  return (
    <>
    <ErrorBoundaryTester />
    <SuspenseBoundaryTester />
    <Button onClick={() => logout()}>Logout</Button>
    </>
  )
}

export default DashboardHome