
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { EscrowProvider } from "@/contexts/EscrowContext";
import { CartProvider } from "@/contexts/CartContext";
import Footer from '@/components/Layout/Footer';
import Navbar from '@/components/Layout/Navbar';
import AppLayout from '@/components/Layout/AppLayout';
import QueryProvider from '@/contexts/QueryProvider';
import '@/index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Secure Marketplace',
  description: 'A secure escrow-based marketplace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <TooltipProvider>
            <AuthProvider>
              <EscrowProvider>
                <CartProvider>
                  <Toaster />
                  <Sonner /> 
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <AppLayout>
                      <div className="container mx-auto px-4 py-8">
                        {children}
                      </div>
                    </AppLayout>
                    <Footer />
                  </div>
                </CartProvider>
              </EscrowProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
