"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/dashboard/admin/Header";
import Sidebar from "@/components/dashboard/admin/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const sidebarVariants = {
  hidden: { x: -280 },
  visible: { x: 0 }
};

export default function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Close sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] md:hidden"
            >
              <Sidebar onClose={closeMobileSidebar} isMobile={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden md:ml-0">
          {/* Header */}
          <Header 
            title="Dashboard" 
            onMenuClick={toggleMobileSidebar}
          />

          {/* Page content */}
          <main className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 overflow-auto">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className=""
              >
                <div className="w-full overflow-x-auto rounded-lg bg-card shadow-sm">
                  <div className="min-w-full">
                    {children}
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}