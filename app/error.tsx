'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 page-container">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <p className="text-gray-500">{error.message}</p>
      <button className="btn-primary px-6 py-2 rounded-xl" onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
