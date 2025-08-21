"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Bell, 
  Search, 
  Menu,
  Settings,
  User,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  className?: string;
}

const searchSuggestions = [
  // { label: "Courses", value: "courses", href: "/dashboard/admin/courses" },
  { label: "Blogs", value: "blogs", href: "/dashboard/admin/blogs" },
  { label: "Signup", value: "signup", href: "/dashboard/admin/signup" },
  { label: "Gallery", value: "gallery", href: "/dashboard/admin/gallery" },
  { label: "Contact", value: "contact", href: "/dashboard/admin/contact" },
  {label: "Hotel", value: "hotel", href: "/dashboard/admin/hotel" },
  { label: "Users", value: "users", href: "/dashboard/admin/users" },
  { label: "Vendors", value: "vendors", href: "/dashboard/admin/vendors" },
  { label: "Wedding Themes", value: "themes", href: "/dashboard/admin/wedding"},
  { label: "Hero", value: "hero", href: "/dashboard/admin/hero" },
  { label: "Hero Extension", value: "hero-extension", href: "/dashboard/admin/hero-extension" },
  { label: "Testimonials", value: "testimonials", href: "/dashboard/admin/testimonials" },
  { label: "About", value: "about", href: "/dashboard/admin/about" },
  { label: "Logout", value: "logout", href: "/logout" },

];

const notifications = [
  { id: 1, title: "New user registered", time: "2 min ago", type: "info" },
  { id: 2, title: "Lead converted", time: "5 min ago", type: "success" },
  { id: 3, title: "System maintenance", time: "1 hour ago", type: "warning" },
];

const headerVariants : Variants= {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const searchVariants = {
  focused: { scale: 1.02, transition: { duration: 0.2 } },
  unfocused: { scale: 1, transition: { duration: 0.2 } }
};

const Header = ({ title, onMenuClick, className }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "sticky top-0 z-30 w-full h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b",
        className
      )}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-xl font-semibold hidden sm:block">{title}</h1>
          </motion.div>

          {/* Search Bar - Desktop */}
          <motion.div
            variants={searchVariants}
            whileFocus="focused"
            className="hidden lg:block"
          >
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-[300px] justify-between text-muted-foreground"
                >
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Search dashboard...</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:inline-flex">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Navigation">
                      {searchSuggestions
                        .filter(item => 
                          item.label.toLowerCase().includes(searchValue.toLowerCase())
                        )
                        .map((item) => (
                          <CommandItem
                            key={item.value}
                            onSelect={() => {
                              setSearchOpen(false);
                              // Navigate to item.href
                              router.push(item.href);

                            }}
                            value={item.value}
                            className="cursor-pointer"
                            
                          >
                            {item.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Search Button - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          {/* <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <AnimatePresence>
                  {notifications.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {notifications.length}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Notifications</h4>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all read
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notification.type === "info" && "bg-blue-500",
                        notification.type === "success" && "bg-green-500",
                        notification.type === "warning" && "bg-yellow-500"
                      )} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    SA
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Shadi Venue Admin</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                <span onClick={() => router.push('/logout')}>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;