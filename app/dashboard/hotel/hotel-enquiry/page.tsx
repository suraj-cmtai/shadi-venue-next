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
  User,
  AlertCircle,
  Crown,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Eye,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";

import {
  fetchHotelEnquiriesByAuthId,
  updateHotelEnquiry,
  deleteHotelEnquiry,
  selectHotelEnquiries,
  selectHotelEnquiryLoading,
  selectHotelEnquiryError,
  HotelEnquiry,
} from "@/lib/redux/features/hotelEnquirySlice";

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

export default function HotelEnquiryListPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const enquiries = useAppSelector(selectHotelEnquiries);
  const isLoading = useAppSelector(selectHotelEnquiryLoading);
  const error = useAppSelector(selectHotelEnquiryError);
  const auth = useSelector(selectAuth);

  const [selectedEnquiry, setSelectedEnquiry] = useState<HotelEnquiry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState<HotelEnquiry | null>(null);

  // Get authId from auth slice
  const authId = auth?.data?.roleId;
  const isHotel = auth?.data?.role === "hotel";

  useEffect(() => {
    if (isHotel && authId) {
      dispatch(fetchHotelEnquiriesByAuthId(authId));
    }
  }, [auth, authId, isHotel, dispatch]);

  // If not a hotel or no authId, show appropriate message
  if (!isHotel || !authId) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page is only available for authenticated hotels.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if error is related to premium access
  const isPremiumError = error?.includes("premium") || error?.includes("Premium");

  const getStatusColor = (status: HotelEnquiry["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Contacted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: HotelEnquiry["status"]) => {
    switch (status) {
      case "Pending":
        return <Circle className="w-4 h-4" />;
      case "Contacted":
        return <MessageCircle className="w-4 h-4" />;
      case "Closed":
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

    dispatch(updateHotelEnquiry({ id: editData.id, data: updateData }))
      .unwrap()
      .then(() => {
        toast.success("Hotel enquiry updated successfully!");
        setIsEditDialogOpen(false);
        setSelectedEnquiry(null);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to update enquiry: ${getErrorMessage(err)}`)
      );
  };

  const handleDelete = () => {
    if (!selectedEnquiry) return;
    dispatch(deleteHotelEnquiry(selectedEnquiry.id))
      .unwrap()
      .then(() => {
        toast.success("Hotel enquiry deleted successfully!");
        setIsDeleteDialogOpen(false);
        setSelectedEnquiry(null);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to delete enquiry: ${getErrorMessage(err)}`)
      );
  };

  const handleStatusUpdate = (enquiry: HotelEnquiry, newStatus: HotelEnquiry["status"]) => {
    const updateData = {
      name: enquiry.name,
      email: enquiry.email,
      phoneNumber: enquiry.phoneNumber,
      status: newStatus,
    };

    dispatch(updateHotelEnquiry({ id: enquiry.id, data: updateData }))
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
    data: HotelEnquiry;
    setData: React.Dispatch<React.SetStateAction<HotelEnquiry | null>>;
  };

  const EnquiryFormFields = ({ data, setData }: EnquiryFormFieldsProps) => (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4">
      <section>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">
          Enquiry Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Enter name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData(prev => prev ? { ...prev, email: e.target.value } : null)}
              placeholder="Enter email"
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={(e) => setData(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
              placeholder="Enter phone number"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="authId">Hotel Auth ID</Label>
          <Input
            id="authId"
            value={data.authId}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Auth ID cannot be modified
          </p>
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
            onValueChange={(value) => setData(prev => prev ? { ...prev, status: value as HotelEnquiry["status"] } : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hotel enquiries...</p>
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
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Hotel Enquiries</h1>
            <p className="text-muted-foreground">
              View and manage all your hotel enquiries.
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
      {!isLoading && (!enquiries || enquiries.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Enquiries Found</h3>
            <p className="text-muted-foreground mb-4">
              You have not received any hotel enquiries yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enquiries List */}
      {enquiries && enquiries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enquiries.map((enquiry) => (
              <Card key={enquiry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(enquiry.status)}
                      <div>
                        <CardTitle className="text-lg">{enquiry.name}</CardTitle>
                        <CardDescription>{enquiry.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(enquiry.status)} px-3 py-1`}>
                      {enquiry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{enquiry.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(enquiry.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {(["Pending", "Contacted", "Closed"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={enquiry.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusUpdate(enquiry, status)}
                        disabled={enquiry.status === status || isLoading}
                        className="gap-2"
                      >
                        {getStatusIcon(status)}
                        {status}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditData(enquiry);
                        setIsEditDialogOpen(true);
                        setSelectedEnquiry(enquiry);
                      }}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hotel Enquiry</DialogTitle>
            <DialogDescription>
              Update the hotel enquiry information and status.
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
            <DialogTitle>Delete Hotel Enquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hotel enquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Name:</strong> {selectedEnquiry.name}</p>
              <p><strong>Email:</strong> {selectedEnquiry.email}</p>
              <p><strong>Phone Number:</strong> {selectedEnquiry.phoneNumber}</p>
              <p><strong>Status:</strong> {selectedEnquiry.status}</p>
              <p><strong>Auth ID:</strong> {selectedEnquiry.authId}</p>
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