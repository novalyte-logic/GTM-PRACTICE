import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-stone-900">
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-stone-600 mb-6">The requested resource could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
