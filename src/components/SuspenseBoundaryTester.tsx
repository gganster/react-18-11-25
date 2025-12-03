import { lazy } from "react"

export const SuspenseBoundaryTester = lazy(() => new Promise<{ default: React.FC }>((resolve) => setTimeout(() => resolve({ default: () => <div>Suspense boundary tester</div> }), 3000)))