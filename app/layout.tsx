import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GTM Engineer Interview Studio | Practice, Scenarios & Benchmarking',
  description: 'Interactive GTM System Engineer interview simulator, real-world scenario technical problem-solving lab, industry benchmark evaluation, and mock session report generator.',
  openGraph: {
    title: 'GTM Engineer Interview Studio',
    description: 'Interactive GTM System Engineer interview simulator, real-world scenario technical problem-solving lab, industry benchmark evaluation, and mock session report generator.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTM Engineer Interview Studio',
    description: 'Interactive GTM System Engineer interview simulator, real-world scenario technical problem-solving lab, industry benchmark evaluation, and mock session report generator.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full bg-[#fafaf9] text-stone-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <body className="min-h-screen bg-[#fafaf9] text-stone-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

