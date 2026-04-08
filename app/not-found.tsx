import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 page-container">
      <h2 className="text-2xl font-bold text-gray-700">404 — Page not found</h2>
      <p className="text-gray-500">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-primary px-6 py-2 rounded-xl">
        Go home
      </Link>
    </div>
  )
}
