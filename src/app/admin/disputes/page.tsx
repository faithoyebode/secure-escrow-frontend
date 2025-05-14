"use client"
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEscrow } from "@/contexts/EscrowContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDisputesPage = () => {
  const navigate = useRouter();
  const { user } = useAuth();
  const { disputes, getEscrowById } = useEscrow();

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
        <p className="mb-6">Only administrators can access this page.</p>
        <Button onClick={() => navigate.push("/")}>Go to Home</Button>
      </div>
    );
  }

  const pendingDisputes = disputes.filter(
    (dispute) => dispute.status === "pending"
  );
  const resolvedDisputes = disputes.filter(
    (dispute) => dispute.status !== "pending"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dispute Management</h1>

      <div className="space-y-8">
        {/* Pending Disputes */}
        <Card>
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-orange-800">
              Pending Disputes ({pendingDisputes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pendingDisputes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispute ID</TableHead>
                    <TableHead>Raised By</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Date Filed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDisputes.map((dispute) => {
                    const escrow = getEscrowById(dispute.escrowId);
                    return (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">
                          #{dispute.id.substring(7)}
                        </TableCell>
                        <TableCell>
                          {dispute.userName} ({dispute.raisedBy})
                        </TableCell>
                        <TableCell>
                          {escrow ? escrow.productName : "Unknown"}
                        </TableCell>
                        <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                            Pending Review
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() =>
                              navigate.push(`/admin/disputes/${dispute.id}`)
                            }
                            size="sm"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No pending disputes to review.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resolved Disputes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Resolved Disputes ({resolvedDisputes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {resolvedDisputes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispute ID</TableHead>
                    <TableHead>Raised By</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Date Filed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resolved On</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedDisputes.map((dispute) => {
                    const escrow = getEscrowById(dispute.escrowId);
                    return (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">
                          #{dispute.id.substring(7)}
                        </TableCell>
                        <TableCell>
                          {dispute.userName} ({dispute.raisedBy})
                        </TableCell>
                        <TableCell>
                          {escrow ? escrow.productName : "Unknown"}
                        </TableCell>
                        <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              dispute.status === "resolved"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {dispute.status === "resolved"
                              ? "Resolved"
                              : "Rejected"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {dispute.resolvedAt
                            ? formatDate(dispute.resolvedAt)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate.push(`/admin/disputes/${dispute.id}`)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No resolved disputes yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{disputes.length}</p>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{pendingDisputes.length}</p>
              <p className="text-sm text-gray-500 mt-1">Require action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {disputes.length > 0
                  ? Math.round(
                      (resolvedDisputes.length / disputes.length) * 100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-500 mt-1">Disputes resolved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDisputesPage;
