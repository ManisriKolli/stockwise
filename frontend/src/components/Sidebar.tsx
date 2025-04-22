"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";

const publicNavItems = [
  { name: "Home", path: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
];

const privateNavItems = [
  { name: "Watchlist", path: "/watchlist", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { name: "insider", path: "/insider", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 border-r border-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-8">StockWise</h1>
      <nav className="space-y-2">
        {/* Always visible navigation items */}
        {publicNavItems.map((item, index) => (
          <Link 
            key={index} 
            href={item.path}
            className={`flex items-center gap-2 py-2 ${pathname === item.path ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </Link>
        ))}
        
        {/* Navigation items only visible when signed in */}
        <SignedIn>
          {privateNavItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.path}
              className={`flex items-center gap-2 py-2 ${pathname === item.path ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
        </SignedIn>
      </nav>
    </aside>
  );
}