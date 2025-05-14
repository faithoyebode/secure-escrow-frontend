
"use client"
import { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

// Create a reusable layout component for client-side components
// that need access to auth context
type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  
  return (
    <>
      {user?.role === "seller" && (
        <div className="bg-green-50 py-2 px-4 text-center">
          <div className="container mx-auto flex items-center justify-center">
            <span className="text-green-800 text-sm mr-2">Access your seller funds</span>
            <Button asChild variant="outline" size="sm" className="h-8 border-green-600 text-green-700 hover:bg-green-100">
              <Link href="/seller/wallet">View Wallet</Link>
            </Button>
          </div>
        </div>
      )}
      <main className="flex-grow pt-16">{children}</main>
    </>
  );
};

export default AppLayout;
