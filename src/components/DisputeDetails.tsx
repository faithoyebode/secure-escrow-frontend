
import { Dispute, Escrow } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type DisputeDetailsProps = {
  dispute: Dispute;
  escrow?: Escrow;
};

const DisputeDetails = ({ dispute, escrow }: DisputeDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Dispute #{dispute.id.substring(7)}
          </CardTitle>
          <Badge
            variant={
              dispute.status === "resolved"
                ? "default"
                : dispute.status === "rejected"
                ? "destructive"
                : "secondary"
            }
          >
            {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-gray-500">Filed By</h4>
          <p>
            {dispute.userName} ({dispute.raisedBy})
          </p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-500">Reason</h4>
          <p className="text-sm whitespace-pre-wrap">{dispute.reason}</p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-500">Filed On</h4>
          <p className="text-sm">
            {format(new Date(dispute.createdAt), "PPP")}
          </p>
        </div>

        {dispute.resolvedAt && (
          <div>
            <h4 className="font-medium text-sm text-gray-500">Resolved On</h4>
            <p className="text-sm">
              {format(new Date(dispute.resolvedAt), "PPP")}
            </p>
          </div>
        )}

        {dispute.adminNotes && (
          <div>
            <h4 className="font-medium text-sm text-gray-500">Admin Notes</h4>
            <p className="text-sm whitespace-pre-wrap">{dispute.adminNotes}</p>
          </div>
        )}

        {dispute.evidence && dispute.evidence.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-2">Evidence</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dispute.evidence.map((item, index) => (
                <div key={index} className="border rounded overflow-hidden bg-gray-50">
                  <img
                    src={item}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisputeDetails;
