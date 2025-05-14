
import { ReactNode } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
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
      <Footer />
    </div>
  );
};

export default Layout;
