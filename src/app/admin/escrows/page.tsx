
"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/utils/format";
import { TransactionStatus } from "@/types";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminEscrowsPage = () => {
  const { user } = useAuth();
  const { escrows, refreshEscrows, processExpiredEscrows } = useEscrow();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "admin") {
      router.push("/");
    } else if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    // Refresh escrows data when component mounts
    if (user && user.role === "admin") {
      refreshEscrows();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const pendingEscrows = escrows.filter(
    escrow => [TransactionStatus.PENDING, TransactionStatus.AWAITING_DELIVERY].includes(escrow.status)
  );

  const expiredEscrows = pendingEscrows.filter(
    escrow => escrow.expiryDate && new Date(escrow.expiryDate) < new Date()
  );

  const nearExpiryEscrows = pendingEscrows.filter(
    escrow => 
      escrow.expiryDate && 
      new Date(escrow.expiryDate) > new Date() && 
      new Date(escrow.expiryDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
  );

  const handleProcessExpired = async () => {
    setIsProcessing(true);
    try {
      await processExpiredEscrows();
    } finally {
      setIsProcessing(false);
    }
  };

  const getDaysRemaining = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const now = new Date();
    
    // If expired, return negative days
    if (expiryDate < now) {
      const timeDiff = now.getTime() - expiryDate.getTime();
      return -Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    const timeDiff = expiryDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert ms to days and round up
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage escrow transactions</p>
        </div>
        <Button onClick={() => router.push("/admin")}>
          Back to Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{pendingEscrows.length}</CardTitle>
            <CardDescription>Active Escrows</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Transactions currently in escrow
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{nearExpiryEscrows.length}</CardTitle>
            <CardDescription>Near Expiry</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              Escrows expiring in the next 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{expiredEscrows.length}</CardTitle>
            <CardDescription>Expired Escrows</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-red-700">
              Escrows that have passed their expiry date
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              className="w-full" 
              onClick={handleProcessExpired}
              disabled={expiredEscrows.length === 0 || isProcessing}
              variant={expiredEscrows.length > 0 ? "destructive" : "outline"}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Expired Escrows"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Expired Escrows</CardTitle>
          <CardDescription>
            These escrows have passed their expiry date and need to be processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiredEscrows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredEscrows.map((escrow) => (
                  <TableRow key={escrow.id}>
                    <TableCell className="font-medium">
                      #{escrow.id.substring(0, 6)}
                    </TableCell>
                    <TableCell>{escrow.productName}</TableCell>
                    <TableCell>{formatCurrency(escrow.amount)}</TableCell>
                    <TableCell>{escrow.buyerName}</TableCell>
                    <TableCell>{escrow.sellerName}</TableCell>
                    <TableCell>
                      {formatDate(escrow.expiryDate || "")}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {escrow.expiryDate && Math.abs(getDaysRemaining(escrow.expiryDate))} days
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        onClick={() => router.push(`/escrow/${escrow.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No expired escrows found
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Near Expiry Escrows</CardTitle>
          <CardDescription>
            These escrows will expire within the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nearExpiryEscrows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nearExpiryEscrows.map((escrow) => (
                  <TableRow key={escrow.id}>
                    <TableCell className="font-medium">
                      #{escrow.id.substring(0, 6)}
                    </TableCell>
                    <TableCell>{escrow.productName}</TableCell>
                    <TableCell>{formatCurrency(escrow.amount)}</TableCell>
                    <TableCell>{escrow.buyerName}</TableCell>
                    <TableCell>{escrow.sellerName}</TableCell>
                    <TableCell>
                      {formatDate(escrow.expiryDate || "")}
                    </TableCell>
                    <TableCell className={`font-medium ${
                      escrow.expiryDate && getDaysRemaining(escrow.expiryDate) <= 3
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}>
                      {escrow.expiryDate && getDaysRemaining(escrow.expiryDate)} days
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        onClick={() => router.push(`/escrow/${escrow.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No escrows near expiry
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEscrowsPage;
