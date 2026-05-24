import Navigation from '../components/Navigation';
import './globals.css';

export const metadata = {
  title: 'Mini Lead Distribution',
  description: 'A Next.js Lead Distribution App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navigation />

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
