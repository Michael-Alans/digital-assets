"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role || "BUYER";

  const buyerLinks = [
    { name: "My Assets", href: "/buyer/my-assets" }, // [cite: 11]
  ];

  const creatorLinks = [
    { name: "Creator Dashboard", href: "/creator/assets" }, // [cite: 14]
    { name: "New Asset", href: "/creator/assets/new" }, // [cite: 15]
  ];

  const links = role === "CREATOR" ? [...buyerLinks, ...creatorLinks] : buyerLinks;

  return (
    <aside className="w-64 bg-slate-50/50 p-6 hidden md:block">
      <nav className="space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Navigation
        </p>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}