"use client"; // Required to use hooks like usePathname

import { usePathname } from "next/navigation";
import Header from "../../components/(website)/Header";
import Footer from "@/components/(website)/Footer";
import FloatingButton from "@/components/(website)/floating-button";
import Popup from "@/components/(website)/popup";
import { ReactNode } from "react";

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  // Get the current path from the URL
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/" && pathname !== "/login" && pathname !== "/signup" && pathname !== "/invite" && <Popup />}

      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButton />
    </>
  );
}
