
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Escrow, TransactionStatus } from "@/types";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { useState } from "react";
import { Package, Clock, CheckCircle, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

type EscrowCardProps = {
  escrow: Escrow;
  showActions?: boolean;
};

const EscrowCard = ({ escrow, showActions = true }: EscrowCardProps) => {
  const { user } = useAuth();
  const { markAsDelivered, completeTransaction } = useEscrow();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  
  const isBuyer = user?.id === escrow.buyerId;
  const isSeller = user?.id === escrow.sellerId;
  
  // Action permissions based on role and status
  const canMarkDelivered = isSeller && escrow.status === TransactionStatus.AWAITING_DELIVERY;
  const canReleasePayment = isBuyer && escrow.status === TransactionStatus.DELIVERED;

  // Check if escrow is expired or close to expiring
  const isExpired = escrow.expiryDate && new Date(escrow.expiryDate) < new Date();
  const isCloseToExpiry = escrow.expiryDate && 
    new Date(escrow.expiryDate) > new Date() && 
    new Date(escrow.expiryDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return "secondary";
      case TransactionStatus.AWAITING_DELIVERY:
        return "secondary";
      case TransactionStatus.DELIVERED:
        return "outline";
      case TransactionStatus.COMPLETED:
        return "default";
      case TransactionStatus.DISPUTED:
        return "destructive";
      case TransactionStatus.REFUNDED:
        return "outline";
      case TransactionStatus.CANCELED:
        return "outline";
      case TransactionStatus.EXPIRED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatStatus = (status: TransactionStatus) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleMarkAsDelivered = async () => {
    setIsUpdating(true);
    try {
      await markAsDelivered(escrow.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReleasePayment = async () => {
    setIsUpdating(true);
    try {
      await completeTransaction(escrow.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    const expiryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert ms to days and round up
  };

  const daysRemaining = getDaysRemaining(escrow.expiryDate);

  // Get the primary product to show (first one)
  const primaryProduct = escrow.products && escrow.products.length > 0
    ? escrow.products[0]
    : null;

  const totalProducts = escrow.products ? escrow.products.length : 0;
  const hasMultipleProducts = totalProducts > 1;

  return (
    <Card className="overflow-hidden escrow-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Transaction #{escrow.id.substring(0, 6)}</CardTitle>
          <Badge variant={getStatusBadgeVariant(escrow.status)}>
            {formatStatus(escrow.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {primaryProduct ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-md overflow-hidden">
                <img
                  src={primaryProduct.productImage}
                  alt={primaryProduct.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{primaryProduct.productName}</h3>
                <p className="text-sm text-gray-500">
                  {formatCurrency(primaryProduct.price)} x {primaryProduct.quantity}
                </p>
                {hasMultipleProducts && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1 h-8 p-0 text-sm text-blue-600"
                    onClick={() => setShowAllProducts(!showAllProducts)}
                  >
                    {showAllProducts ? (
                      <>Hide <ChevronUp className="h-3 w-3 ml-1" /></>
                    ) : (
                      <>+{totalProducts - 1} more items <ChevronDown className="h-3 w-3 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Additional products if expanded */}
            {showAllProducts && escrow.products.slice(1).map(product => (
              <div key={product.id} className="flex items-center space-x-4 border-t pt-3">
                <div className="w-14 h-14 rounded-md overflow-hidden">
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{product.productName}</h3>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(product.price)} x {product.quantity}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Buyer: {escrow.buyerName}</span>
                <span>Seller: {escrow.sellerName}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="font-semibold text-escrow-blue">{formatCurrency(escrow.amount)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No products found in this transaction</div>
        )}
        
        {escrow.expiryDate && (
          <div className={`mt-3 flex items-center text-sm ${isExpired ? 'text-red-500' : isCloseToExpiry ? 'text-amber-500' : 'text-gray-500'}`}>
            <Clock className="h-4 w-4 mr-1" />
            {isExpired ? (
              "Expired"
            ) : (
              <>
                Expires: {formatExpiryDate(escrow.expiryDate)}
                {daysRemaining !== null && (
                  <span className="ml-1 font-medium">
                    ({daysRemaining === 0 ? "Today" : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`})
                  </span>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Show "Confirm Delivery" button for sellers */}
        {canMarkDelivered && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={handleMarkAsDelivered}
            disabled={isUpdating}
          >
            <Package className="h-4 w-4 mr-2" />
            {isUpdating ? "Processing..." : "Confirm Delivery"}
          </Button>
        )}

        {/* Show "Release Payment" button for buyers */}
        {canReleasePayment && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 border-green-500 text-green-600 hover:bg-green-50"
            onClick={handleReleasePayment}
            disabled={isUpdating}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {isUpdating ? "Processing..." : "Release Payment"}
          </Button>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="pt-0">
          <Link href={`/escrow/${escrow.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default EscrowCard;
