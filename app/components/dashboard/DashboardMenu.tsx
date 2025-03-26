"use client";

import Link from "next/link";

interface MenuItem {
  href: string;
  title: string;
  description: string;
}

interface DashboardMenuProps {
  items: MenuItem[];
}

export default function DashboardMenu({ items }: DashboardMenuProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
          <p className="text-gray-600">{item.description}</p>
        </Link>
      ))}
    </div>
  );
}
