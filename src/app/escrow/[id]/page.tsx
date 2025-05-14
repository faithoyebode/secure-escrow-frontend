"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { Escrow, TransactionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import DisputeForm from "@/components/DisputeForm";
import DisputeDetails from "@/components/DisputeDetails";
import DisputeComments from "@/components/DisputeComments";
import SellerWallet from "@/components/SellerWallet";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import escrowService from "@/services/escrowService";
import disputeService from "@/services/disputeService";
import { toast } from "@/components/ui/use-toast";

const EscrowDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { user } = useAuth();
  const { refreshEscrows } = useEscrow();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extensionDays, setExtensionDays] = useState("14");
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [dispute, setDispute] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    const fetchEscrowDetails = async () => {
      if (!id || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to be able to access escrow page.",
          variant: "destructive",
        });
        navigate.push("/login");
        return;
      }

      setLoading(true);
      try {
        // Fetch escrow details
        const escrowDetails = await escrowService.getEscrow(id as string);
        setEscrow(escrowDetails);

        // Try to fetch any dispute for this escrow
        try {
          const disputes = await disputeService.getUserDisputes();
          const relatedDispute = disputes.find((d) => d.escrowId === id);
          if (relatedDispute) {
            setDispute(relatedDispute);
          }
        } catch (err) {
          console.error("Error fetching dispute:", err);
        }
      } catch (err) {
        console.error("Error loading escrow details:", err);
        navigate.push("/escrow");
      } finally {
        setLoading(false);
      }
    };

    fetchEscrowDetails();
  }, [id, user, navigate]);

  useEffect(() => {
    if (!loading && !escrow) {
      navigate.push("/escrow");
    }
  }, [escrow, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-escrow-blue mb-4" />
        <p className="text-gray-500">Loading transaction details...</p>
      </div>
    );
  }

  if (!escrow) {
    return null;
  }

  const isBuyer = user?.id === escrow.buyerId;
  const isSeller = user?.id === escrow.sellerId;
  const isAdmin = user?.role === "admin";

  // Check if escrow is expired or close to expiring
  const isExpired =
    escrow.expiryDate && new Date(escrow.expiryDate) < new Date();
  const isCloseToExpiry =
    escrow.expiryDate &&
    new Date(escrow.expiryDate) > new Date() &&
    new Date(escrow.expiryDate).getTime() - new Date().getTime() <
      3 * 24 * 60 * 60 * 1000; // 3 days

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!escrow.expiryDate) return null;

    const expiryDate = new Date(escrow.expiryDate);
    const now = new Date();

    // If expired, return 0
    if (expiryDate < now) return 0;

    const timeDiff = expiryDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert ms to days and round up
  };

  const daysRemaining = getDaysRemaining();

  const handleUpdateStatus = async (status: TransactionStatus) => {
    setIsUpdating(true);
    try {
      const updatedEscrow = await escrowService.updateEscrowStatus(escrow.id, {
        status,
      });
      setEscrow(updatedEscrow);
      await refreshEscrows();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExtendExpiry = async () => {
    setIsUpdating(true);
    try {
      const updatedEscrow = await escrowService.updateEscrowExpiry(escrow.id, {
        days: parseInt(extensionDays),
      });
      setEscrow(updatedEscrow);
      await refreshEscrows();
      setShowExtendDialog(false);
    } catch (error) {
      console.error("Error extending expiry:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const primaryProduct =
    escrow.products && escrow.products.length > 0 ? escrow.products[0] : null;

  const totalProducts = escrow.products ? escrow.products.length : 0;
  const hasMultipleProducts = totalProducts > 1;

  const renderActions = () => {
    if (escrow.status === TransactionStatus.DISPUTED) {
      return null;
    }

    if (isBuyer) {
      return (
        <div className="space-y-4">
          {escrow.status === TransactionStatus.DELIVERED && (
            <Button
              onClick={() => handleUpdateStatus(TransactionStatus.COMPLETED)}
              disabled={isUpdating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Release Payment
            </Button>
          )}
          {(escrow.status === TransactionStatus.PENDING ||
            escrow.status === TransactionStatus.AWAITING_DELIVERY ||
            escrow.status === TransactionStatus.DELIVERED) && (
            <Button
              variant="outline"
              onClick={() => setShowDisputeForm(true)}
              disabled={isUpdating || !!dispute}
              className="w-full"
            >
              Raise Dispute
            </Button>
          )}
        </div>
      );
    }

    if (isSeller) {
      return (
        <div className="space-y-4">
          {escrow.status === TransactionStatus.AWAITING_DELIVERY && (
            <Button
              onClick={() => handleUpdateStatus(TransactionStatus.DELIVERED)}
              disabled={isUpdating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Delivery
            </Button>
          )}

          {(escrow.status === TransactionStatus.PENDING ||
            escrow.status === TransactionStatus.AWAITING_DELIVERY ||
            escrow.status === TransactionStatus.DELIVERED) && (
            <Button
              variant="outline"
              onClick={() => setShowDisputeForm(true)}
              disabled={isUpdating || !!dispute}
              className="w-full"
            >
              Raise Dispute
            </Button>
          )}

          {isSeller && (
            <div className="mt-6">
              <SellerWallet />
            </div>
          )}
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="space-y-4">
          {escrow.status !== TransactionStatus.COMPLETED &&
            escrow.status !== TransactionStatus.CANCELED &&
            escrow.status !== TransactionStatus.EXPIRED && (
              <Button
                variant="outline"
                onClick={() => setShowExtendDialog(true)}
                disabled={isUpdating}
                className="w-full"
              >
                Extend Escrow Period
              </Button>
            )}
        </div>
      );
    }

    return null;
  };

  const formatStatus = (status: TransactionStatus): string => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => navigate.push("/escrow")}
        className="mb-6"
      >
        Back to Transactions
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Transaction #{escrow.id.substring(0, 8)}...
                </CardTitle>
                <Badge
                  variant={
                    escrow.status === "completed" ? "default" : "secondary"
                  }
                  className="text-sm"
                >
                  {formatStatus(escrow.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
                  <img
                    src={escrow.products?.[0].productImage}
                    alt={escrow.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold"></h2>
                  <p className="text-gray-500">Amount: {formatCurrency(escrow.amount)}</p>
                </div>
              </div> */}

              {primaryProduct && (
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
                      <h3 className="font-medium">
                        {primaryProduct.productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(primaryProduct.price)} x{" "}
                        {primaryProduct.quantity}
                      </p>
                      {hasMultipleProducts && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-8 p-0 text-sm text-blue-600"
                          onClick={() => setShowAllProducts(!showAllProducts)}
                        >
                          {showAllProducts ? (
                            <>
                              Hide <ChevronUp className="h-3 w-3 ml-1" />
                            </>
                          ) : (
                            <>
                              +{totalProducts - 1} more items{" "}
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Additional products if expanded */}
                  {showAllProducts &&
                    escrow.products.slice(1).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-4 border-t pt-3"
                      >
                        <div className="w-14 h-14 rounded-md overflow-hidden">
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">
                            {product.productName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(product.price)} x {product.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Buyer</h3>
                  <p>{escrow.buyerName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Seller</h3>
                  <p>{escrow.sellerName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Created Date
                  </h3>
                  <p>{formatDate(escrow.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated
                  </h3>
                  <p>{formatDate(escrow.updatedAt)}</p>
                </div>
              </div>

              {escrow.expiryDate && (
                <div
                  className={`flex items-center p-4 rounded-md ${
                    isExpired
                      ? "bg-red-50 border border-red-200"
                      : isCloseToExpiry
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  {isExpired ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  ) : isCloseToExpiry ? (
                    <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  ) : (
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        isExpired
                          ? "text-red-700"
                          : isCloseToExpiry
                          ? "text-amber-700"
                          : "text-blue-700"
                      }`}
                    >
                      {isExpired
                        ? "Escrow Expired"
                        : isCloseToExpiry
                        ? "Escrow Expiring Soon"
                        : "Escrow Expiry Date"}
                    </p>
                    <p
                      className={`text-sm ${
                        isExpired
                          ? "text-red-600"
                          : isCloseToExpiry
                          ? "text-amber-600"
                          : "text-blue-600"
                      }`}
                    >
                      {isExpired ? (
                        `Expired on ${formatDate(escrow.expiryDate)}`
                      ) : (
                        <>
                          {formatDate(escrow.expiryDate)}
                          {daysRemaining !== null && (
                            <span className="ml-1 font-medium">
                              (
                              {daysRemaining === 0
                                ? "Today"
                                : `${daysRemaining} day${
                                    daysRemaining !== 1 ? "s" : ""
                                  } remaining`}
                              )
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display dispute if exists */}
          {dispute && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Dispute Information</h2>
              <DisputeDetails dispute={dispute} escrow={escrow} />
              <DisputeComments dispute={dispute} />
              {isAdmin && dispute.status === "pending" && (
                <Button
                  onClick={() => navigate.push(`/admin/disputes/${dispute.id}`)}
                  className="w-full"
                >
                  Resolve This Dispute
                </Button>
              )}
            </div>
          )}

          {/* Show dispute form when button clicked */}
          {showDisputeForm && !dispute && (
            <Card>
              <CardHeader>
                <CardTitle>Raise a Dispute</CardTitle>
              </CardHeader>
              <CardContent>
                <DisputeForm
                  escrowId={escrow.id}
                  onSuccess={async () => {
                    const disputes = await disputeService.getUserDisputes();
                    const relatedDispute = disputes.find(
                      (d) => d.escrowId === id
                    );
                    if (relatedDispute) {
                      setDispute(relatedDispute);
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Actions</CardTitle>
            </CardHeader>
            <CardContent>{renderActions()}</CardContent>
          </Card>

          {/* Transaction Status Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Transaction Timeline</CardTitle>
            </CardHeader>
            <CardContent className="relative pb-6">
              <div className="border-l-2 border-gray-200 pl-4 ml-2 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Transaction Created</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(escrow.createdAt)}
                    </p>
                  </div>
                </div>

                {escrow.status !== TransactionStatus.PENDING && (
                  <div className="relative">
                    <div
                      className={`absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full ${
                        escrow.status === TransactionStatus.AWAITING_DELIVERY ||
                        escrow.status === TransactionStatus.DELIVERED ||
                        escrow.status === TransactionStatus.COMPLETED
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">Payment Confirmed</p>
                      <p className="text-sm text-gray-500">
                        Funds held in escrow
                      </p>
                    </div>
                  </div>
                )}

                {(escrow.status === TransactionStatus.DELIVERED ||
                  escrow.status === TransactionStatus.COMPLETED) && (
                  <div className="relative">
                    <div
                      className={`absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full ${
                        escrow.status === TransactionStatus.DELIVERED ||
                        escrow.status === TransactionStatus.COMPLETED
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">Delivery Confirmed</p>
                      <p className="text-sm text-gray-500">
                        Product has been delivered
                      </p>
                    </div>
                  </div>
                )}

                {escrow.status === TransactionStatus.COMPLETED && (
                  <div className="relative">
                    <div className="absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium">Transaction Completed</p>
                      <p className="text-sm text-gray-500">
                        Funds released to seller
                      </p>
                    </div>
                  </div>
                )}

                {escrow.status === TransactionStatus.DISPUTED && (
                  <div className="relative">
                    <div className="absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full bg-red-500"></div>
                    <div>
                      <p className="font-medium">Dispute Raised</p>
                      <p className="text-sm text-gray-500">
                        Transaction is under dispute
                      </p>
                    </div>
                  </div>
                )}

                {escrow.status === TransactionStatus.REFUNDED && (
                  <div className="relative">
                    <div className="absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="font-medium">Funds Refunded</p>
                      <p className="text-sm text-gray-500">
                        Money returned to buyer
                      </p>
                    </div>
                  </div>
                )}

                {escrow.status === TransactionStatus.CANCELED && (
                  <div className="relative">
                    <div className="absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full bg-gray-500"></div>
                    <div>
                      <p className="font-medium">Transaction Canceled</p>
                      <p className="text-sm text-gray-500">
                        Order has been canceled
                      </p>
                    </div>
                  </div>
                )}

                {escrow.status === TransactionStatus.EXPIRED && (
                  <div className="relative">
                    <div className="absolute -left-[1.45rem] top-1 w-3 h-3 rounded-full bg-red-500"></div>
                    <div>
                      <p className="font-medium">Transaction Expired</p>
                      <p className="text-sm text-gray-500">
                        Escrow period has expired
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extend Escrow Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Escrow Period</DialogTitle>
            <DialogDescription>
              You can extend the escrow period to give more time for the
              transaction to complete.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Extend by:</label>
              <Select value={extensionDays} onValueChange={setExtensionDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Select days to extend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Current expiry date
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {escrow.expiryDate
                      ? formatDate(escrow.expiryDate)
                      : "No expiry date set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExtendDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExtendExpiry} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isUpdating ? "Processing..." : "Extend Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EscrowDetailsPage;
