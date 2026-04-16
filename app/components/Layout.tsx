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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-white dark:bg-gray-800 shadow-lg transition duration-300 md:relative md:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="py-5 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Mini API Debug Toolkit</h2>
          <button
            onClick={toggleSidebar}
            aria-label="Close menu"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition md:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6 px-4 pb-6">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/tools/json" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <DocumentTextIcon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>JSON Formatter</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">auto parse + reverse</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/tools/jwt" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <LockClosedIcon className="h-5 w-5" />
                <span>JWT Decoder</span>
              </Link>
            </li>
            <li>
              <Link href="/tools/timestamp" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ClockIcon className="h-5 w-5" />
                <span>Timestamp Converter</span>
              </Link>
            </li>
            <li>
              <Link href="/tools/base64" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <CodeBracketIcon className="h-5 w-5" />
                <span>Base64 Tool</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                aria-label="Open menu"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 md:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mini API Debug Toolkit</h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>

        <footer className="text-center text-gray-500 dark:text-gray-400 px-4 py-4 md:px-6">
          <p>&copy; 2026 Mini API Debug Toolkit. Built with Love and Passion.</p>
        </footer>
      </div>
    </div>
  );
}