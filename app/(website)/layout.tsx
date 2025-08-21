import "../globals.css";
import Header from "../../components/(website)/Header";
import type { ReactNode } from "react";
import Footer from "@/components/(website)/Footer";
import FloatingButton from "@/components/(website)/floating-button";
import Popup from "@/components/(website)/popup";

/**
 * Website layout with Header and main content container.
 * - Uses max-w-7xl and responsive Tailwind classes as per project rules.
 */
export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
    <Popup />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingButton />
    </>
  );
} 