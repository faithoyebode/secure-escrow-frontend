
"use client"
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/format";
import walletService, { WithdrawalData } from "@/services/walletService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet } from "lucide-react";

const SellerWallet = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch the wallet balance when component mounts
  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getWalletBalance();
      setBalance(response.balance);
    } catch (error) {
      console.error("Error fetching wallet balance", error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return;
    }

    // Validate bank details
    if (!bankName || !accountNumber || !accountName) {
      toast({
        title: "Missing information",
        description: "Please fill in all bank details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const withdrawalData: WithdrawalData = {
        amount,
        accountDetails: {
          bankName,
          accountNumber,
          accountName
        }
      };
      
      const result = await walletService.withdrawFunds(withdrawalData);
      
      if (result.success) {
        toast({
          title: "Withdrawal successful",
          description: `${formatCurrency(amount)} has been sent to your bank account`,
        });
        
        // Update balance
        fetchWalletBalance();
        
        // Reset form
        setWithdrawalAmount("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");
        
        // Close dialog
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Withdrawal failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          Your Wallet
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
        <p className="text-sm text-gray-500 mt-2">
          Available balance from completed transactions
        </p>
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-escrow-blue hover:bg-escrow-teal">
              <Wallet className="mr-2 h-4 w-4" />
              Withdraw Funds
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Enter the amount you want to withdraw and your bank details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleWithdraw}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    max={balance}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Enter account name"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Withdraw"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default SellerWallet;
