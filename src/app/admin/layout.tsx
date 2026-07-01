"use client";
export const dynamic = "force-dynamic";
import React from "react";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50 p-6">{children}</div>;
}
