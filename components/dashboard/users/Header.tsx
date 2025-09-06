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
import { useAppSelector } from "@/lib/redux/hooks";
import { selectAuth } from "@/lib/redux/features/authSlice";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  className?: string;
}

const searchSuggestions = [
  { label: "Dashboard", value: "dashboard", href: "/dashboard/user" },
  // { label: "Blogs", value: "blogs", href: "/dashboard/blogs" },
  // { label: "Subscribers", value: "leads", href: "/dashboard/subscribers" },
  // { label: "Gallery", value: "gallery", href: "/dashboard/gallery" },
  // { label: "Contact", value: "contact", href: "/dashboard/contact" },
  // {label: "Test", value: "test", href: "/dashboard/test" },
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
  const auth = useAppSelector(selectAuth);
  const [displayName, setDisplayName] = useState("User");
  
  useEffect(() => {
    if (auth?.data?.name) {
      setDisplayName(auth.data.name);
    } else if (auth?.data?.companyName) {
      setDisplayName(auth.data.companyName);
    } else {
      setDisplayName("User");
    }
  }, [auth]);

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

          {/* Welcome Name - Desktop */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-muted-foreground">
              Welcome, {displayName}
            </p>
          </div>

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
                  <p className="text-sm font-medium leading-none">{`Welcome, ${displayName}`}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem  onClick={() => router.push('/logout')} className="text-red-600 focus:text-red-600 cursor-pointer">
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;