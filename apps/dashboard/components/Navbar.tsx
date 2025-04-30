'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          MTA Delay Tracker
        </Link>
        <div className="space-x-6">
          <Link
            href="/"
            className={`px-4 py-2 rounded-md text-base font-medium ${
              pathname === '/'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            href="/causes"
            className={`px-4 py-2 rounded-md text-base font-medium ${
              pathname === '/causes'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Causes
          </Link>
        </div>
      </div>
    </nav>
  );
} 