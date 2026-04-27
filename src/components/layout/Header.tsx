"use client";

import { Bell, Search, Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      if (search.trim().length === 15 && /^\d+$/.test(search.trim())) {
        router.push(`/inventory?search=${search.trim()}`);
      } else {
        router.push(`/inventory?search=${search.trim()}`);
      }
      setSearch("");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-indigo-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"
        >
          <Menu className="w-4 h-4 text-indigo-600" />
        </button>
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-slate-800">
            {title}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <input
            type="text"
            placeholder="Search products, IMEI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="pl-9 pr-4 py-2 text-sm bg-indigo-50 rounded-xl border-0 outline-none focus:ring-2 focus:ring-indigo-400 w-48 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-md shadow-indigo-200">
          A
        </div>
      </div>
    </header>
  );
}