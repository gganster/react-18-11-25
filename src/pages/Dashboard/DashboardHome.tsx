import { ErrorBoundaryTester } from "@/components/ErrorBoundaryTester"
import { SuspenseBoundaryTester } from "@/components/SuspenseBoundaryTester"

function DashboardHome() {
  return (
    <>
    <ErrorBoundaryTester />
    <SuspenseBoundaryTester />
    </>
  )
}

export default DashboardHome