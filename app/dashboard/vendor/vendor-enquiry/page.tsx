"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
  User,
  AlertCircle,
  Crown,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  PlayCircle,
} from "lucide-react";

import {
  fetchVendorEnquiriesByAuthId,
  updateVendorEnquiry,
  deleteVendorEnquiry,
  selectVendorEnquiries,
  selectVendorEnquiryLoading,
  selectVendorEnquiryError,
  VendorEnquiry,
  VendorEnquiryStatus,
} from "@/lib/redux/features/vendorEnquirySlice";

import { selectAuth } from "@/lib/redux/features/authSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function VendorEnquiryListPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const vendorEnquiries = useAppSelector(selectVendorEnquiries);
  const isLoading = useAppSelector(selectVendorEnquiryLoading);
  const error = useAppSelector(selectVendorEnquiryError);
  const auth = useSelector(selectAuth);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState<VendorEnquiry | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<VendorEnquiry | null>(null);

  // Get authId from auth slice
  const authId = auth?.data?.roleId;
  const isVendor = auth?.data?.role === "vendor";

  useEffect(() => {
    if (isVendor && authId) {
      dispatch(fetchVendorEnquiriesByAuthId(authId));
    }
  }, [auth, authId, isVendor, dispatch]);

  // If not a vendor or no authId, show appropriate message
  if (!isVendor || !authId) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page is only available for authenticated vendors.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if error is related to premium access
  const isPremiumError = error?.includes("premium") || error?.includes("Premium");

  const getStatusColor = (status: VendorEnquiry["status"]) => {
    switch (status) {
      case VendorEnquiryStatus.NEW:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case VendorEnquiryStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case VendorEnquiryStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: VendorEnquiry["status"]) => {
    switch (status) {
      case VendorEnquiryStatus.NEW:
        return <Circle className="w-4 h-4" />;
      case VendorEnquiryStatus.IN_PROGRESS:
        return <PlayCircle className="w-4 h-4" />;
      case VendorEnquiryStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const handleUpdate = () => {
    if (!editData) return;

    const updateData = {
      name: editData.name,
      email: editData.email,
      phoneNumber: editData.phoneNumber,
      status: editData.status,
    };

    dispatch(updateVendorEnquiry({ id: editData.id, data: updateData }))
      .unwrap()
      .then(() => {
        toast.success("Enquiry updated successfully!");
        setIsEditDialogOpen(false);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to update enquiry: ${getErrorMessage(err)}`)
      );
  };

  const handleDelete = () => {
    if (!selectedEnquiry) return;
    dispatch(deleteVendorEnquiry(selectedEnquiry.id))
      .unwrap()
      .then(() => {
        toast.success("Enquiry deleted successfully!");
        setIsDeleteDialogOpen(false);
        setSelectedEnquiry(null);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to delete enquiry: ${getErrorMessage(err)}`)
      );
  };

  const handleStatusUpdate = (newStatus: VendorEnquiryStatus) => {
    if (!selectedEnquiry) return;

    const updateData = {
      name: selectedEnquiry.name,
      email: selectedEnquiry.email,
      phoneNumber: selectedEnquiry.phoneNumber,
      status: newStatus,
    };

    dispatch(updateVendorEnquiry({ id: selectedEnquiry.id, data: updateData }))
      .unwrap()
      .then(() => {
        toast.success(`Status updated to ${newStatus}!`);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to update status: ${getErrorMessage(err)}`)
      );
  };

  // Reusable Form Component
  type EnquiryFormFieldsProps = {
    data: VendorEnquiry;
    setData: React.Dispatch<React.SetStateAction<VendorEnquiry | null>>;
  };

  const EnquiryFormFields = ({ data, setData }: EnquiryFormFieldsProps) => (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4">
      <section>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Enter contact name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData(prev => prev ? { ...prev, email: e.target.value } : null)}
              placeholder="Enter email address"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={(e) => setData(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">
          Status Management
        </h3>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={data.status}
            onValueChange={(value) => setData(prev => prev ? { ...prev, status: value as VendorEnquiryStatus } : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VendorEnquiryStatus.NEW}>New</SelectItem>
              <SelectItem value={VendorEnquiryStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={VendorEnquiryStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );

  // New: List selection handler
  const handleSelectEnquiry = (enquiry: VendorEnquiry) => {
    setSelectedEnquiry(enquiry);
    setEditData(enquiry);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/vendor")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/vendor")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Vendor Enquiries</h1>
            <p className="text-muted-foreground">
              View and manage all your customer enquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Premium Access Error */}
      {isPremiumError && (
        <Alert className="border-orange-200 bg-orange-50">
          <Crown className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Premium Feature:</strong> Access to enquiries requires a premium subscription. 
            Please upgrade your account to view and manage enquiries.
          </AlertDescription>
        </Alert>
      )}

      {/* General Error Display */}
      {error && !isPremiumError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* No Enquiries */}
      {!isLoading && (!vendorEnquiries || vendorEnquiries.length === 0) && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Enquiries Found</h3>
            <p className="text-muted-foreground mb-4">
              You have not received any enquiries yet.
            </p>
            <Button onClick={() => router.push("/dashboard/vendor")}>
              Go Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enquiries List and Details */}
      {vendorEnquiries && vendorEnquiries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Enquiry List */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">All Enquiries</CardTitle>
              <CardDescription>
                Select an enquiry to view details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {vendorEnquiries.map((enquiry) => (
                  <Button
                    key={enquiry.id}
                    variant={selectedEnquiry && selectedEnquiry.id === enquiry.id ? "default" : "outline"}
                    className="justify-between w-full"
                    onClick={() => handleSelectEnquiry(enquiry)}
                  >
                    <span className="flex items-center gap-2">
                      {getStatusIcon(enquiry.status)}
                      {enquiry.name}
                    </span>
                    <Badge className={getStatusColor(enquiry.status)}>
                      {enquiry.status}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enquiry Details */}
          <div className="md:col-span-2">
            {selectedEnquiry ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6"
              >
                {/* Status and Quick Actions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(selectedEnquiry.status)}
                        <div>
                          <CardTitle className="text-lg">Status Management</CardTitle>
                          <CardDescription>Current enquiry status and quick actions</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(selectedEnquiry.status)} px-3 py-1`}>
                        {selectedEnquiry.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {Object.values(VendorEnquiryStatus).map((status) => (
                        <Button
                          key={status}
                          variant={selectedEnquiry.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusUpdate(status)}
                          disabled={selectedEnquiry.status === status || isLoading}
                          className="gap-2"
                        >
                          {getStatusIcon(status)}
                          {status}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Contact Information
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditData(selectedEnquiry);
                            setIsEditDialogOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                            <p className="text-base font-semibold">{selectedEnquiry.name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                            <p className="text-base">{selectedEnquiry.email}</p>
                            <Button variant="link" className="p-0 h-auto font-normal" asChild>
                              <a href={`mailto:${selectedEnquiry.email}`}>Send Email</a>
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                            <p className="text-base">{selectedEnquiry.phoneNumber}</p>
                            <Button variant="link" className="p-0 h-auto font-normal" asChild>
                              <a href={`tel:${selectedEnquiry.phoneNumber}`}>Call Now</a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                          <p className="text-base font-semibold">
                            {format(new Date(selectedEnquiry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                          <p className="text-base font-semibold">
                            {format(new Date(selectedEnquiry.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Enquiry Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Please select an enquiry from the list to view its details.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Enquiry</DialogTitle>
            <DialogDescription>
              Update the enquiry information and status.
            </DialogDescription>
          </DialogHeader>
          {editData && (
            <EnquiryFormFields
              data={editData}
              setData={setEditData}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Name:</strong> {selectedEnquiry.name}</p>
              <p><strong>Email:</strong> {selectedEnquiry.email}</p>
              <p><strong>Phone:</strong> {selectedEnquiry.phoneNumber}</p>
              <p><strong>Status:</strong> {selectedEnquiry.status}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Enquiry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}