"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-h-screen flex-1 overflow-hidden lg:ml-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
