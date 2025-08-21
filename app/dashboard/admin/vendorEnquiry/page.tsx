"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  MoreHorizontal,
  Mail,
  Phone,
} from "lucide-react";

import {
  fetchEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  selectEnquiries,
  selectEnquiryLoading,
  selectEnquiryError,
  VendorEnquiry,
} from "@/lib/redux/features/vendorEnquirySlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// This should match the Omit type in your slice
type NewEnquiryState = Omit<VendorEnquiry, "id" | "createdAt" | "updatedAt">;

const initialEnquiryState: NewEnquiryState = {
  businessName: "",
  category: "Others",
  yearOfEstablishment: "",
  contactPersonName: "",
  designation: "Other",
  mobileNumber: "",
  whatsappNumber: "",
  emailId: "",
  websiteOrSocial: "",
  fullAddress: "",
  city: "",
  state: "",
  pinCode: "",
  serviceAreas: "Local City",
  servicesOffered: [],
  startingPrice: 0,
  guestCapacityMin: 0,
  guestCapacityMax: 0,
  facilitiesAvailable: [],
  specialities: "",
  logoUrl: "",
  coverImageUrl: "",
  portfolioImageUrls: [],
  videoLinks: [],
  about: "",
  awards: "",
  notableClients: "",
  advancePaymentPercent: 0,
  refundPolicy: "",
  paymentModesAccepted: [],
  status: "Pending",
};

export default function VendorEnquiryPage() {
  const dispatch = useAppDispatch();
  const enquiries = useAppSelector(selectEnquiries);
  const isLoading = useAppSelector(selectEnquiryLoading);
  const error = useAppSelector(selectEnquiryError);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<VendorEnquiry | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEnquiry, setNewEnquiry] =
    useState<NewEnquiryState>(initialEnquiryState);

  useEffect(() => {
    dispatch(fetchEnquiries());
  }, [dispatch]);

  const filteredEnquiries = enquiries.filter((enquiry: VendorEnquiry) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      enquiry.contactPersonName.toLowerCase().includes(searchLower) ||
      enquiry.emailId.toLowerCase().includes(searchLower) ||
      enquiry.city.toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: VendorEnquiry["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAdd = () => {
    // Note: File uploads need to be handled separately. This assumes JSON data for now.
    dispatch(createEnquiry(newEnquiry))
      .unwrap()
      .then(() => {
        toast.success("Enquiry added successfully!");
        setIsAddDialogOpen(false);
        setNewEnquiry(initialEnquiryState);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to add enquiry: ${getErrorMessage(err)}`)
      );
  };

  const handleUpdate = () => {
    if (!selectedEnquiry) return;
    dispatch(updateEnquiry({ id: selectedEnquiry.id, data: selectedEnquiry }))
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
    dispatch(deleteEnquiry(selectedEnquiry.id))
      .unwrap()
      .then(() => {
        toast.success("Enquiry deleted successfully!");
        setIsDeleteDialogOpen(false);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to delete enquiry: ${getErrorMessage(err)}`)
      );
  };

  // Reusable Form Component
  type EnquiryFormFieldsProps = {
    data: NewEnquiryState | VendorEnquiry;
    setData: React.Dispatch<React.SetStateAction<any>>;
  };
  const EnquiryFormFields = ({ data, setData }: EnquiryFormFieldsProps) => (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto p-1 pr-4">
      {/* Step 1 & 2 */}
      <section>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">
          Business & Contact Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Business Name*</Label>
            <Input
              value={data.businessName}
              onChange={(e) =>
                setData({ ...data, businessName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Category*</Label>
            <Select
              value={data.category}
              onValueChange={(value) => setData({ ...data, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{/* ... options ... */}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Contact Person*</Label>
            <Input
              value={data.contactPersonName}
              onChange={(e) =>
                setData({ ...data, contactPersonName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Email*</Label>
            <Input
              type="email"
              value={data.emailId}
              onChange={(e) => setData({ ...data, emailId: e.target.value })}
            />
          </div>
        </div>
      </section>
      {/* Add more sections for all form fields */}
      <section>
        <h3 className="font-semibold text-lg border-b pb-2 mt-6">Management</h3>
        <div>
          <Label>Status</Label>
          <Select
            value={data.status}
            onValueChange={(value) => setData({ ...data, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendor Enquiries</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Enquiry
        </Button>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <motion.div layout className="rounded-md border">
        <Table>
          <TableHeader>{/* ... table header ... */}</TableHeader>
          <TableBody>
            {isLoading && enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No enquiries found
                </TableCell>
              </TableRow>
            ) : (
              filteredEnquiries.map((enquiry: VendorEnquiry) => (
                <motion.tr
                  key={enquiry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <TableCell>
                    <div className="font-medium">
                      {enquiry.contactPersonName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{enquiry.emailId}</div>
                  </TableCell>
                  <TableCell>{enquiry.city}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(enquiry.status)}>
                      {enquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(enquiry.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
      {/* Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor Enquiry</DialogTitle>
          </DialogHeader>
          <EnquiryFormFields data={newEnquiry} setData={setNewEnquiry} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Enquiry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor Enquiry</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <EnquiryFormFields
              data={selectedEnquiry}
              setData={setSelectedEnquiry}
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enquiry</DialogTitle>
            <DialogDescription>Are you sure?</DialogDescription>
          </DialogHeader>
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
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
