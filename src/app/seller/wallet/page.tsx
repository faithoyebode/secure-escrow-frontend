"use client"
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import SellerWallet from "@/components/SellerWallet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SellerWalletPage = () => {
  const navigate = useRouter();
  const { user } = useAuth();
  const { getUserEscrows } = useEscrow();

  if (!user || user.role !== "seller") {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
        <p className="mb-6">Only sellers can access this page.</p>
        <Button onClick={() => navigate.push("/")}>Go to Home</Button>
      </div>
    );
  }

  // Get completed transactions for the seller
  const completedTransactions = getUserEscrows().filter(
    (escrow) => escrow.status === "completed"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => navigate.push("/escrow")}
        className="mb-6"
      >
        Back to Transactions
      </Button>

      <h1 className="text-3xl font-bold mb-8">Seller Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <SellerWallet />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">Instant Access</h4>
                <p className="text-gray-600">
                  All your completed transaction funds are immediately available.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Secure Storage</h4>
                <p className="text-gray-600">
                  Your funds are securely stored and can be withdrawn at any time.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Transaction History</h4>
                <p className="text-gray-600">
                  View all your completed transactions in one place.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {completedTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Date Completed</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          #{transaction.id.substring(6)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.productName}
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.updatedAt)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate.push(`/escrow/${transaction.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    No completed transactions yet. Once your transactions are completed, they will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerWalletPage;
