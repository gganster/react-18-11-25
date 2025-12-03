import { Outlet, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import ErrorBoundaryFallback from "@/components/ErrorBoundaryFallback"
import SuspenseFallback from "@/components/SuspenseFallback"

const DashboardLayout = () => {
  const location = useLocation()

  const navItems = [
    { path: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Menu className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center border-b bg-card px-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold">Tableau de bord</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
            <Suspense fallback={<SuspenseFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout