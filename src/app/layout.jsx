import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Mini Lead Distribution',
  description: 'A Next.js Lead Distribution App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center w-full h-16">
              <div className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
                Mini Lead Distribution System
              </div>
              <div className="flex items-center space-x-8">
                <Link href="/request-service" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                  Request Service
                </Link>
                <Link href="/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                  Dashboard
                </Link>
                <Link href="/test-tools" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                  Test Tools
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
