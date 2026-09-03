import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xs">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 mb-2">Page Not Found</h2>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          The requested resource or view could not be located in GTM-Pulse Studio.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition"
        >
          Return to Studio Dashboard
        </Link>
      </div>
    </div>
  );
}
