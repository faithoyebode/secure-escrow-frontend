
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import DisputeDetails from "@/components/DisputeDetails";
import DisputeComments from "@/components/DisputeComments";

const DisputeResolutionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { user } = useAuth();
  const { getDisputeById, getEscrowById, resolveDispute } = useEscrow();
  const [resolution, setResolution] = useState<"accept" | "reject">("accept");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispute = getDisputeById(id as string);
  console
  const escrow = dispute ? getEscrowById(dispute.escrowId) : undefined;

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
        <p className="mb-6">Only administrators can access this page.</p>
        <Button onClick={() => navigate.push("/")}>Go to Home</Button>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Dispute Not Found</h2>
        <p className="mb-6">The dispute you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate.push("/admin/disputes")}>Back to Disputes</Button>
      </div>
    );
  }

  const handleResolve = async () => {
    if (!notes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide resolution notes",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await resolveDispute(dispute.id, resolution, notes);
      if (success) {
        navigate.push("/admin/disputes");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => navigate.push("/admin/disputes")}
        className="mb-6"
      >
        Back to Disputes
      </Button>

      <h1 className="text-3xl font-bold mb-8">Dispute Resolution</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <DisputeDetails dispute={dispute} escrow={escrow} />

          {dispute && (
            <div className="mt-8">
              <DisputeComments dispute={dispute} />
            </div>
          )}         
        </div>

        <div>
          {dispute.status === "pending" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resolve Dispute</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="resolution">Resolution</Label>
                  <RadioGroup
                    id="resolution"
                    value={resolution}
                    onValueChange={(value) => setResolution(value as "accept" | "reject")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="accept" id="accept" />
                      <Label htmlFor="accept" className="cursor-pointer">
                        Accept the dispute{" "}
                        {dispute.raisedBy === "buyer"
                          ? "(Refund to buyer)"
                          : "(Release to seller)"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reject" id="reject" />
                      <Label htmlFor="reject" className="cursor-pointer">
                        Reject the dispute{" "}
                        {dispute.raisedBy === "buyer"
                          ? "(Release to seller)"
                          : "(Refund to buyer)"}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter your resolution notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button
                  onClick={handleResolve}
                  disabled={isSubmitting || !notes.trim()}
                  className="w-full bg-escrow-blue hover:bg-escrow-teal"
                >
                  {isSubmitting ? "Submitting..." : "Submit Resolution"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resolution Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Status</h4>
                  <p className="text-lg font-semibold">
                    {dispute.status === "resolved" ? "Resolved" : "Rejected"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">
                    Resolved On
                  </h4>
                  <p>
                    {dispute.resolvedAt
                      ? new Date(dispute.resolvedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Notes</h4>
                  <p className="whitespace-pre-wrap">{dispute.adminNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Admin Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">Carefully Review Evidence</h4>
                <p className="text-gray-600">
                  Examine all provided documentation before making a decision.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Be Impartial</h4>
                <p className="text-gray-600">
                  Make decisions based on facts, not on the reputation or history of either party.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Provide Clear Reasoning</h4>
                <p className="text-gray-600">
                  Explain your decision thoroughly in the admin notes.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Consider Transaction History</h4>
                <p className="text-gray-600">
                  Look at the full transaction timeline before resolving.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisputeResolutionPage;
