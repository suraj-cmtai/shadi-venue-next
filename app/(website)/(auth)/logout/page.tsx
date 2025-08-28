"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/redux/features/authSlice";

const LogoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Dispatch the logout action which will handle both API call and state update
        await dispatch(logout() as any);
        
        // Redirect after a brief delay
        const timer = setTimeout(() => {
          router.push("/");
          router.refresh(); // Refresh to update navigation state
        }, 2000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Logout error:', error);
        router.push("/");
      }
    };

    handleLogout();
  }, [router]);

  return (    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl border shadow-lg p-8 flex flex-col items-center">
        <div className="bg-orange/10 p-4 rounded-full">
          <LogOut className="w-12 h-12 text-orange" />
        </div>
        <h2 className="text-2xl font-bold mt-6 text-navy">Signing Out</h2>
        <div className="text-gray-600 text-sm mt-2">Thanks for using Shadi Venue</div>
        <div className="text-gray-500 text-sm mt-1">Redirecting to homepage...</div>
        <div className="mt-6 w-8 h-8 border-2 border-orange/20 border-t-orange rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default LogoutPage;