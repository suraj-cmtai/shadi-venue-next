"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpenText,
  LogOut,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectAuth } from "@/lib/redux/features/authSlice"; // Adjust path to your auth slice

// All possible links
const allLinks = [
  { name: "Dashboard", href: "/dashboard/hotel", icon: LayoutDashboard, badge: null, requiredStatus: null,},
  { name: "Hotel Enquiry", href: "/dashboard/hotel/hotel-enquiry", icon: BookOpenText, badge: null, requiredStatus: null,},
  // Add other links here with their required statuses if any
];

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const sidebarVariants: Variants = {
  open: { width: 280, transition: { duration: 0.3, ease: "easeInOut" } },
  collapsed: { width: 80, transition: { duration: 0.3, ease: "easeInOut" } },
};

const linkVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const textVariants = {
  hidden: { opacity: 0, width: 0, transition: { duration: 0.2 } },
  visible: {
    opacity: 1,
    width: "auto",
    transition: { duration: 0.3, delay: 0.1 },
  },
};

const Sidebar = ({ onClose, isMobile = false }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const authState = useAppSelector(selectAuth);
  // Assuming the status is stored in userInfo.hotelStatus
  const hotelStatus = authState?.userInfo?.hotelStatus;

  // Filter links based on the user's hotel status
  type LinkType = {
    name: string;
    href: string;
    icon: any;
    badge: any;
    requiredStatus?: string | null;
  };
  const visibleLinks = allLinks.filter((link: LinkType) => {
    if (link.requiredStatus) {
      return hotelStatus === link.requiredStatus;
    }
    return true;
  });

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };
  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };
  const handleLogout = () => {
    if (isMobile && onClose) {
      onClose();
    }
    router.push("/logout");
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed && !isMobile ? "collapsed" : "open"}
      className="flex flex-col h-full bg-background border-r"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <AnimatePresence>
          {(!isCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center space-x-3"
            >
              <Link href="/" target="_blank">
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-600 to-navy-600 text-white">
                      SA
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
              <div>
                <Link href="/" target="_blank" className="text-lg font-bold">
                  <span className="text-navy">Shadi</span>{" "}
                  <span className="text-orange">Venue</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8"
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>
        )}
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <TooltipProvider>
          {visibleLinks.map((link, index) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            const LinkContent = (
              <motion.div
                variants={linkVariants}
                whileHover="hover"
                whileTap="tap"
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted/50"
                )}
                onClick={handleLinkClick}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <AnimatePresence>
                  {(!isCollapsed || isMobile) && (
                    <motion.div
                      variants={textVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <span className="font-medium truncate">{link.name}</span>
                      {link.badge && (
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="ml-2 h-5 px-2 text-xs"
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
            return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {isCollapsed && !isMobile ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={link.href}>{LinkContent}</Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <span>{link.name}</span>
                      {link.badge && (
                        <Badge
                          variant="outline"
                          className="h-5 px-2 text-xs ml-2"
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link href={link.href}>{LinkContent}</Link>
                )}
              </motion.div>
            );
          })}
        </TooltipProvider>
      </nav>
      <Separator />
      <div className="p-4">
        <TooltipProvider>
          {isCollapsed && !isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-12"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Logout</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          )}
        </TooltipProvider>
      </div>
    </motion.div>
  );
};
export default Sidebar;