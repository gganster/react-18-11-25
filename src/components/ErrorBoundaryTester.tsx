import { useState } from "react"

export const ErrorBoundaryTester = () => {
  const [error, setError] = useState(false)

  if (error) {
    throw new Error("Test error")
  }

  return (
    <div>
      <button onClick={() => {
        setError(true)
      }} className="bg-red-500 text-white p-2 rounded-md">
        Throw error
      </button>
    </div>
  )
}

export default ErrorBoundaryTester