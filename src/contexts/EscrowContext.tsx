
"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Escrow, Dispute, DisputeComment, TransactionStatus } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import escrowService from '@/services/escrowService';
import disputeService from '@/services/disputeService';

type EscrowContextType = {
  escrows: Escrow[];
  disputes: Dispute[];
  loading: boolean;
  error: string | null;
  refreshEscrows: () => Promise<void>;
  getEscrowById: (id: string) => Escrow | undefined;
  getDisputeById: (id: string) => Dispute | undefined;
  getDisputeByEscrowId: (escrowId: string) => Dispute | undefined;
  getUserEscrows: () => Escrow[];
  updateEscrowStatus: (id: string, status: TransactionStatus) => Promise<void>;
  updateEscrowExpiry: (id: string, days: number) => Promise<void>;
  createDispute: (escrowId: string, reason: string, evidence: File[]) => Promise<boolean>;
  markAsDelivered: (id: string) => Promise<void>;
  completeTransaction: (id: string) => Promise<void>;
  processExpiredEscrows: () => Promise<void>;
  getDisputeComments: (disputeId: string) => DisputeComment[];
  addDisputeComment: (disputeId: string, content: string, attachments: File[]) => Promise<boolean>;
  resolveDispute: (disputeId: string, resolution: "accept" | "reject", notes: string) => Promise<boolean>;
};

const EscrowContext = createContext<EscrowContextType | null>(null);

export const EscrowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [comments, setComments] = useState<{ [disputeId: string]: DisputeComment[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEscrows = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let userEscrows: Escrow[];
      
      if (user.role === 'admin') {
        userEscrows = await escrowService.getAllEscrows();
      } else {
        userEscrows = await escrowService.getUserEscrows();
      }
      
      setEscrows(userEscrows);
      
      // Load disputes for the user
      const userDisputes = await disputeService.getUserDisputes();
      setDisputes(userDisputes);
      
    } catch (err) {
      console.error("Failed to load escrows:", err);
      setError("Failed to load transactions");
      toast({
        title: "Error",
        description: "Failed to load your transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEscrows();
    } else {
      // Clear state when user logs out
      setEscrows([]);
      setDisputes([]);
    }
  }, [user]);

  const refreshEscrows = async () => {
    await loadEscrows();
  };

  const getEscrowById = (id: string) => {
    return escrows.find((escrow) => escrow.id === id);
  };

  // Adding the missing getDisputeById function
  const getDisputeById = (id: string) => {
    return disputes.find((dispute) => dispute.id === id);
  };

  const getDisputeByEscrowId = (escrowId: string) => {
    return disputes.find((dispute) => dispute.escrowId === escrowId);
  };

  const getUserEscrows = () => {
    return escrows;
  };

  const updateEscrowStatus = async (id: string, status: TransactionStatus) => {
    setLoading(true);
    try {
      await escrowService.updateEscrowStatus(id, { status });
      await refreshEscrows();
      toast({
        title: "Status Updated",
        description: "Transaction status has been updated successfully",
      });
    } catch (err) {
      console.error("Failed to update escrow status:", err);
      toast({
        title: "Error",
        description: "Failed to update transaction status",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to mark escrow as delivered (for sellers)
  const markAsDelivered = async (id: string) => {
    setLoading(true);
    try {
      await escrowService.updateEscrowStatus(id, { status: TransactionStatus.DELIVERED });
      await refreshEscrows();
      toast({
        title: "Delivery Confirmed",
        description: "You have confirmed delivery of this transaction",
      });
    } catch (err) {
      console.error("Failed to mark escrow as delivered:", err);
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to complete transaction and release payment (for buyers)
  const completeTransaction = async (id: string) => {
    setLoading(true);
    try {
      await escrowService.updateEscrowStatus(id, { status: TransactionStatus.COMPLETED });
      await refreshEscrows();
      toast({
        title: "Transaction Completed",
        description: "Payment has been released to the seller",
      });
    } catch (err) {
      console.error("Failed to complete transaction:", err);
      toast({
        title: "Error",
        description: "Failed to release payment",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEscrowExpiry = async (id: string, days: number) => {
    setLoading(true);
    try {
      await escrowService.updateEscrowExpiry(id, { days });
      await refreshEscrows();
      toast({
        title: "Expiry Updated",
        description: `Escrow period extended by ${days} days`,
      });
    } catch (err) {
      console.error("Failed to update escrow expiry:", err);
      toast({
        title: "Error",
        description: "Failed to update escrow expiry",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async (escrowId: string, reason: string, evidenceFiles: File[]) => {
    setLoading(true);
    try {
      // Create a FormData object to send files
      const formData = new FormData();
      formData.append('escrowId', escrowId);
      formData.append('reason', reason);
      
      // Append each file to the form data
      if (evidenceFiles && evidenceFiles.length > 0) {
        evidenceFiles.forEach(file => {
          formData.append('evidence', file);
        });
      }
      
      const dispute = await disputeService.createDispute(formData);
      await refreshEscrows();
      toast({
        title: "Dispute Created",
        description: "Your dispute has been submitted successfully",
      });
      return true;
    } catch (err) {
      console.error("Failed to create dispute:", err);
      toast({
        title: "Error",
        description: "Failed to submit dispute",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDisputeComments = (disputeId: string) => {
    return comments[disputeId] || [];
  };

  const loadDisputeComments = async (disputeId: string) => {
    try {
      const disputeComments = await disputeService.getComments(disputeId);
      setComments(prev => ({
        ...prev,
        [disputeId]: disputeComments
      }));
    } catch (err) {
      console.error("Failed to load dispute comments:", err);
    }
  };

  // Load comments when disputes change
  useEffect(() => {
    disputes.forEach(dispute => {
      loadDisputeComments(dispute.id);
    });
  }, [disputes]);

  const addDisputeComment = async (disputeId: string, content: string, attachmentFiles: File[]) => {
    setLoading(true);
    try {
      // Create FormData for the comment and files
      const formData = new FormData();
      formData.append('content', content);
      
      // Append attachments if any
      if (attachmentFiles && attachmentFiles.length > 0) {
        attachmentFiles.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      const comment = await disputeService.addComment(disputeId, formData);
      
      // Update comments state
      setComments(prev => ({
        ...prev,
        [disputeId]: [...(prev[disputeId] || []), comment]
      }));
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully",
      });
      
      return true;
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Add a resolver function for admin to resolve disputes
  const resolveDispute = async (disputeId: string, resolution: "accept" | "reject", notes: string) => {
    setLoading(true);
    try {
      // Determine what escrow status to apply based on the resolution
      const status = resolution === "accept" ? "resolved" : "rejected";
      
      // Call the dispute service to resolve the dispute
      const result = await disputeService.resolveDispute(disputeId, {
        status,
        adminNotes: notes
      });
      
      await refreshEscrows(); // Refresh data after resolution
      
      toast({
        title: "Dispute Resolved",
        description: `The dispute has been ${status.toLowerCase()} successfully.`,
      });
      
      return true;
    } catch (err) {
      console.error("Failed to resolve dispute:", err);
      toast({
        title: "Error",
        description: "Failed to resolve the dispute",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // New function to process expired escrows (admin only)
  const processExpiredEscrows = async () => {
    setLoading(true);
    try {
      const result = await escrowService.processExpiredEscrows();
      await refreshEscrows();
      toast({
        title: "Expired Escrows Processed",
        description: `${result.count} expired escrows have been processed`,
      });
      return result;
    } catch (err) {
      console.error("Failed to process expired escrows:", err);
      toast({
        title: "Error",
        description: "Failed to process expired escrows",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    escrows,
    disputes,
    loading,
    error,
    refreshEscrows,
    getEscrowById,
    getDisputeById,
    getDisputeByEscrowId,
    getUserEscrows,
    updateEscrowStatus,
    updateEscrowExpiry,
    createDispute,
    markAsDelivered,
    completeTransaction,
    processExpiredEscrows,
    getDisputeComments,
    addDisputeComment,
    resolveDispute,
  };

  return (
    <EscrowContext.Provider value={value}>
      {children}
    </EscrowContext.Provider>
  );
};

export const useEscrow = () => {
  const context = useContext(EscrowContext);
  if (!context) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
};
