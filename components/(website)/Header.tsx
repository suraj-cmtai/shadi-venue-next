"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MenuIcon, LogIn, UserPlus, User2, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth, selectIsAuthenticated } from "@/lib/redux/features/authSlice";
import { logout } from "@/lib/redux/features/authSlice";

// Image assets
const LOGO_IMG = "/images/logo-blue.png";
const FLOWER_IMG = "/images/flower-vector.svg";

// Add nav routes
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Venue", href: "/venue" },
  { label: "Inspiration", href: "/inspiration" },
  { label: "Blog", href: "/blogs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

// Role to Dashboard Mapping
const ROLE_DASHBOARDS: Record<string, string> = {
  "super-admin": "/dashboard/super-admin",
  "admin": "/dashboard/admin",
  "hotel": "/dashboard/hotel",
  "vendor": "/dashboard/vendor",
  "user": "/dashboard/user",
};

export default function Header() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const auth = useSelector(selectAuth);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Handler for logout
  const handleLogout = () => {
    dispatch(logout() as any);
    setSheetOpen(false);
  };

  // Memoize dashboard link for the current role
  const dashboardHref = useMemo(() => {
    if (auth?.role && ROLE_DASHBOARDS[auth.role]) {
      return ROLE_DASHBOARDS[auth.role];
    }
    return "/dashboard/user";
  }, [auth?.role]);

  return (
    <header className="w-full bg-neutral-50/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-2 min-h-12 md:min-h-16 gap-2 md:gap-4">
        {/* Logo and Flower */}
        <div className="flex items-center gap-2 md:gap-4 min-w-fit">
          <motion.img
            src={LOGO_IMG}
            alt="Logo"
            className="h-8 sm:h-10 w-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.img
            src={FLOWER_IMG}
            alt="Decorative Flower"
            className="h-6 sm:h-8 w-auto md:h-12"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        {/* Desktop Navbar - only show on xl and up */}
        <nav className="hidden xl:flex flex-1 items-center justify-center">
          <ul className="flex flex-row gap-6 lg:gap-10 text-[#212d47] text-sm font-medium font-cormorant uppercase tracking-wide">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className="whitespace-nowrap">
                <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Desktop Auth Buttons/User - only show on xl and up */}
        <div className="hidden xl:flex items-center gap-2 min-w-fit">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-sm font-medium font-cormorant min-w-[7rem]"
                  aria-label="Login"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="default"
                  className="flex items-center gap-2 rounded-xs uppercase text-white bg-[#212d47] text-sm font-medium font-cormorant min-w-[7rem]"
                  aria-label="Sign Up"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={dashboardHref} tabIndex={0} aria-label="Go to dashboard" className="min-w-[7rem]">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-xs uppercase text-[#212d47] text-sm font-medium font-cormorant min-w-[7rem]"
                  aria-label="User Dashboard"
                >
                  <User2 className="h-4 w-4" />
                  <span className="truncate max-w-[6rem]">{auth?.name || "User"}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-sm font-medium font-cormorant min-w-[7rem]"
                aria-label="Logout"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
        {/* Hamburger: show on all screens except xl and up */}
        <div className="flex xl:hidden flex-1 justify-end">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#212d47]">
                <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            {/* SheetContent appears from the left side */}
            <SheetContent side="left" className="p-0 w-full max-w-xs">
              <SheetTitle hidden aria-hidden="true">Shadi Venue</SheetTitle>
              <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Logo and Flower in Sheet */}
                <div className="flex items-center gap-2 mb-4">
                  <img src={LOGO_IMG} alt="Logo" className="h-8 w-auto" />
                  <img src={FLOWER_IMG} alt="Decorative Flower" className="h-6 w-auto" />
                </div>
                {/* Nav */}
                <nav>
                  <ul className="flex flex-col gap-4 text-[#212d47] text-base font-medium font-cormorant uppercase">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.label}>
                        <a href={item.href} className="hover:text-primary transition-colors">{item.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
                {/* Auth Buttons/User */}
                <div className="mt-6 flex flex-col gap-3">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/login" passHref legacyBehavior>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-base font-medium font-cormorant w-full"
                          aria-label="Login"
                          onClick={() => setSheetOpen(false)}
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Login</span>
                        </Button>
                      </Link>
                      <Link href="/signup" passHref legacyBehavior>
                        <Button
                          variant="default"
                          className="flex items-center gap-2 rounded-xs uppercase text-white bg-[#212d47] text-base font-medium font-cormorant w-full"
                          aria-label="Sign Up"
                          onClick={() => setSheetOpen(false)}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Sign Up</span>
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link href={dashboardHref} tabIndex={0} aria-label="Go to dashboard" className="w-full">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 rounded-xs uppercase text-[#212d47] text-base font-medium font-cormorant w-full"
                          aria-label="User Dashboard"
                          tabIndex={-1}
                          onClick={() => setSheetOpen(false)}
                        >
                          <User2 className="h-4 w-4" />
                          <span className="truncate max-w-[10rem]">{auth?.name || "User"}</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border border-[#212d47] rounded-xs bg-white/80 uppercase text-[#212d47] text-base font-medium font-cormorant w-full"
                        aria-label="Logout"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
