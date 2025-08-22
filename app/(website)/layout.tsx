"use client"; // Required to use hooks like usePathname

import { usePathname } from "next/navigation"; // Import the hook
import "../globals.css";
import Header from "../../components/(website)/Header";
import type { ReactNode } from "react";
import Footer from "@/components/(website)/Footer";
import FloatingButton from "@/components/(website)/floating-button";
import Popup from "@/components/(website)/popup";
export default function WebsiteLayout({ children }: { children: ReactNode }) {
  // Get the current path from the URL
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/" && <Popup />}

      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButton />
    </>
  );
}
