
"use client"
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import EscrowCard from "@/components/EscrowCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import ForbiddenPage from "@/components/ForbiddenPage";

const EscrowPage = () => {
  const { user } = useAuth();
  const { escrows, loading, refreshEscrows, getDisputeByEscrowId } = useEscrow();
  
  useEffect(() => {
    if (user) {
      refreshEscrows();
    }
  }, [user]);
  
  const activeEscrows = escrows.filter(
    (escrow) => 
      escrow.status !== TransactionStatus.COMPLETED && 
      escrow.status !== TransactionStatus.REFUNDED && 
      escrow.status !== TransactionStatus.CANCELED
  );
  
  const completedEscrows = escrows.filter(
    (escrow) => 
      escrow.status === TransactionStatus.COMPLETED || 
      escrow.status === TransactionStatus.REFUNDED || 
      escrow.status === TransactionStatus.CANCELED
  );
  
  const disputedEscrows = escrows.filter(
    (escrow) => escrow.status === TransactionStatus.DISPUTED
  );

  if (!user) {
    return (
      <ForbiddenPage message="Please log in to view your escrow transactions." />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Escrow Transactions</h1>
      </div>

      <Tabs defaultValue="active" className="space-y-8">
        <TabsList>
          <TabsTrigger value="active">Active ({activeEscrows.length})</TabsTrigger>
          <TabsTrigger value="disputed">Disputed ({disputedEscrows.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedEscrows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeEscrows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEscrows.map((escrow) => (
                <EscrowCard key={escrow.id} escrow={escrow} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Transactions</CardTitle>
                <CardDescription>
                  You don't have any active escrow transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-escrow-blue hover:bg-escrow-teal">
                  <a href="/products">Browse Products</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disputed" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : disputedEscrows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {disputedEscrows.map((escrow) => (
                <EscrowCard key={escrow.id} escrow={escrow} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Disputed Transactions</CardTitle>
                <CardDescription>
                  You don't have any disputed escrow transactions.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedEscrows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEscrows.map((escrow) => (
                <EscrowCard key={escrow.id} escrow={escrow} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Completed Transactions</CardTitle>
                <CardDescription>
                  You don't have any completed escrow transactions yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">About Escrow Protection</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 border border-gray-100 rounded-lg">
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-escrow-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Secure Payment</h3>
            <p className="text-gray-600 text-sm">
              Your funds are held securely in escrow until you confirm receipt and satisfaction with your purchase.
            </p>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-lg">
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-escrow-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Buyer Protection</h3>
            <p className="text-gray-600 text-sm">
              If the item doesn't match the description or isn't delivered, you can file a dispute to get your money back.
            </p>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-lg">
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-escrow-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Fair Resolution</h3>
            <p className="text-gray-600 text-sm">
              Our dispute resolution process ensures a fair outcome for both buyers and sellers with supported evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscrowPage;
