"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Library, PlusCircle } from "lucide-react";

export function CreatorSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { 
      label: "My Assets", 
      href: "/buyer/my-assets", 
      icon: Library 
    },
    { 
      label: "Creator Dashboard", 
      href: "/creator/assets", 
      icon: LayoutDashboard 
    },
    { 
      label: "New Asset", 
      href: "/creator/assets/new", 
      icon: PlusCircle 
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button - Floating Action Button style */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-2xl active:scale-95 transition-transform"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Actual Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-surface border-r border-border transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Header Area */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-text-main">Creator Hub</span>
              <span className="text-[10px] text-muted uppercase tracking-widest font-semibold">Management</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="md:hidden p-2 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group
                    ${isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-muted hover:bg-muted/10 hover:text-text-main"}
                  `}
                >
                  <item.icon 
                    size={20} 
                    className={`${isActive ? "text-white" : "group-hover:text-primary transition-colors"}`} 
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Optional: Simple Footer inside Sidebar */}
          <div className="pt-6 border-t border-border mt-auto">
             <div className="px-4 py-3 bg-muted/20 rounded-2xl">
                <p className="text-[11px] text-muted text-center">
                  Digital Assets Creator v1.0
                </p>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
}