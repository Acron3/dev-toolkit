'use client';

import Link from "next/link";
import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import { Bars3Icon, XMarkIcon, HomeIcon, DocumentTextIcon, LockClosedIcon, ClockIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'theme-preference';

const themeReducer = (state: boolean, action: boolean | ((prev: boolean) => boolean)) =>
  typeof action === 'function' ? action(state) : action;

export default function Layout({ children }: LayoutProps) {
  const [isDarkMode, dispatchTheme] = useReducer(themeReducer, false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

      if (storedTheme === 'light') {
        dispatchTheme(false);
      } else {
        dispatchTheme(true);
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;

      if (isDarkMode) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    dispatchTheme((prev) => {
      const nextMode = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, nextMode ? 'dark' : 'light');
      }
      return nextMode;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="py-6 px-2 flex items-center justify-center space-x-2">
          {!isSidebarCollapsed && <h2 className="text-xl font-bold text-gray-800 dark:text-white">Mini API Debug Toolkit</h2>}
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <Bars3Icon className="h-6 w-6" />
            ) : (
              <XMarkIcon className="h-6 w-6" />
            )}
          </button>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2 mx-2">
            <li>
              <Link href="/" className={`flex items-center gap-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
                <HomeIcon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>Home</span>}
              </Link>
            </li>
            <li>
              <Link href="/tools/json" className={`flex items-center gap-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
                <DocumentTextIcon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>JSON Formatter</span>}
              </Link>
            </li>
            <li>
              <Link href="/tools/jwt" className={`flex items-center gap-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
                <LockClosedIcon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>JWT Decoder</span>}
              </Link>
            </li>
            <li>
              <Link href="/tools/timestamp" className={`flex items-center gap-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
                <ClockIcon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>Timestamp Converter</span>}
              </Link>
            </li>
            <li>
              <Link href="/tools/base64" className={`flex items-center gap-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
                <CodeBracketIcon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>Base64 Tool</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mini API Debug Toolkit</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-500 dark:text-gray-400">
          <p>&copy; 2026 Mini API Debug Toolkit. Built with Love and Passion.</p>
        </footer>
      </div>
    </div>
  );
}