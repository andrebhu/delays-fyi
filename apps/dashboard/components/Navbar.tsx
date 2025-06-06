'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-black text-white">
      <div className="max-w-4xl mx-auto py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl ml-2 font-bold">
          delays.fyi
        </Link>
        <div className="space-x-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-md text-base font-medium ${
              pathname === '/'
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            href="/metrics"
            className={`px-4 py-2 rounded-md text-base font-medium ${
              pathname === '/metrics'
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Metrics
          </Link>
          <Link
            href="https://mta.info"
            className="px-4 py-2 rounded-md text-base font-medium hover:bg-gray-700 hover:text-white"
          >
            mta.info
          </Link>
        </div>
      </div>
    </nav>
  );
} 