import type { ErrorInfo } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  errorInfo?: ErrorInfo
}

function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Une erreur s'est produite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error.message || "Une erreur inattendue s'est produite"}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} className="flex-1">
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
              className="flex-1"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorBoundaryFallback

