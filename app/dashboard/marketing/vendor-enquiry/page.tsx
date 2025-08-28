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
  User,
} from "lucide-react";

import {
  fetchVendorEnquiries,
  createVendorEnquiry,
  updateVendorEnquiry,
  deleteVendorEnquiry,
  selectVendorEnquiries,
  selectVendorEnquiryLoading,
  selectVendorEnquiryError,
  VendorEnquiry,
  VendorEnquiryStatus,
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
  name: "",
  email: "",
  phoneNumber: "",
  status: VendorEnquiryStatus.NEW,
  authId: "",
};

export default function VendorEnquiryPage() {
  const dispatch = useAppDispatch();
  const enquiries = useAppSelector(selectVendorEnquiries);
  const isLoading = useAppSelector(selectVendorEnquiryLoading);
  const error = useAppSelector(selectVendorEnquiryError);

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
    dispatch(fetchVendorEnquiries());
  }, [dispatch]);

  const filteredEnquiries = enquiries.filter((enquiry: VendorEnquiry) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchLower) ||
      enquiry.email.toLowerCase().includes(searchLower) ||
      enquiry.phoneNumber.toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: VendorEnquiry["status"]) => {
    switch (status) {
      case VendorEnquiryStatus.NEW:
        return "bg-blue-100 text-blue-800";
      case VendorEnquiryStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case VendorEnquiryStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAdd = () => {
    if (!newEnquiry.name || !newEnquiry.email || !newEnquiry.phoneNumber || !newEnquiry.authId) {
      toast.error("Please fill in all required fields");
      return;
    }

    dispatch(createVendorEnquiry(newEnquiry))
      .unwrap()
      .then(() => {
        toast.success("Vendor enquiry added successfully!");
        setIsAddDialogOpen(false);
        setNewEnquiry(initialEnquiryState);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to add enquiry: ${getErrorMessage(err)}`)
      );
  };

  const handleUpdate = () => {
    if (!selectedEnquiry) return;
    
    const updateData = {
      name: selectedEnquiry.name,
      email: selectedEnquiry.email,
      phoneNumber: selectedEnquiry.phoneNumber,
      status: selectedEnquiry.status,
    };

    dispatch(updateVendorEnquiry({ id: selectedEnquiry.id, data: updateData }))
      .unwrap()
      .then(() => {
        toast.success("Vendor enquiry updated successfully!");
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
        toast.success("Vendor enquiry deleted successfully!");
        setIsDeleteDialogOpen(false);
      })
      .catch((err: unknown) =>
        toast.error(`Failed to delete enquiry: ${getErrorMessage(err)}`)
      );
  };

  /*
   * SOLUTION EXPLANATION:
   * 
   * The original issue was caused by:
   * 1. Using 'any' type for setData parameter which broke TypeScript's type checking
   * 2. Using the same component for different data shapes (NewEnquiryState vs VendorEnquiry)
   * 3. React losing track of input state due to inconsistent state management
   * 
   * FIXES APPLIED:
   * 1. Created separate, properly typed form components for Add and Edit operations
   * 2. Each component has its own specific state setter with proper typing
   * 3. Used proper React key props to help React track component identity
   * 4. Ensured consistent state shapes and update patterns
   */

  // FIXED: Separate form component for ADD operation with proper typing
  const AddEnquiryFormFields = () => (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4">
      <section>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="add-name">Name *</Label>
            <Input
              id="add-name"
              key="add-name-input" // Helps React track this specific input
              value={newEnquiry.name}
              onChange={(e) => {
                // FIXED: Proper state update with functional update pattern
                setNewEnquiry(prev => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Enter vendor name"
            />
          </div>
          <div>
            <Label htmlFor="add-email">Email *</Label>
            <Input
              id="add-email"
              key="add-email-input"
              type="email"
              value={newEnquiry.email}
              onChange={(e) => {
                setNewEnquiry(prev => ({ ...prev, email: e.target.value }));
              }}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="add-phoneNumber">Phone Number *</Label>
            <Input
              id="add-phoneNumber"
              key="add-phone-input"
              value={newEnquiry.phoneNumber}
              onChange={(e) => {
                setNewEnquiry(prev => ({ ...prev, phoneNumber: e.target.value }));
              }}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="add-authId">Auth ID *</Label>
            <Input
              id="add-authId"
              key="add-authid-input"
              value={newEnquiry.authId}
              onChange={(e) => {
                setNewEnquiry(prev => ({ ...prev, authId: e.target.value }));
              }}
              placeholder="Enter vendor auth ID"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">
          Status Management
        </h3>
        <div>
          <Label htmlFor="add-status">Status</Label>
          <Select
            key="add-status-select"
            value={newEnquiry.status}
            onValueChange={(value) => {
              setNewEnquiry(prev => ({ ...prev, status: value as VendorEnquiryStatus }));
            }}
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

  // FIXED: Separate form component for EDIT operation with proper typing
  const EditEnquiryFormFields = () => {
    if (!selectedEnquiry) return null;

    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4">
        <section>
          <h3 className="font-semibold text-lg border-b pb-2 mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                key="edit-name-input" // Unique key for edit form
                value={selectedEnquiry.name}
                onChange={(e) => {
                  // FIXED: Proper state update for selectedEnquiry
                  setSelectedEnquiry(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  );
                }}
                placeholder="Enter vendor name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                key="edit-email-input"
                type="email"
                value={selectedEnquiry.email}
                onChange={(e) => {
                  setSelectedEnquiry(prev => 
                    prev ? { ...prev, email: e.target.value } : null
                  );
                }}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-phoneNumber">Phone Number *</Label>
              <Input
                id="edit-phoneNumber"
                key="edit-phone-input"
                value={selectedEnquiry.phoneNumber}
                onChange={(e) => {
                  setSelectedEnquiry(prev => 
                    prev ? { ...prev, phoneNumber: e.target.value } : null
                  );
                }}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-authId">Auth ID *</Label>
              <Input
                id="edit-authId"
                key="edit-authid-input"
                value={selectedEnquiry.authId}
                onChange={(e) => {
                  setSelectedEnquiry(prev => 
                    prev ? { ...prev, authId: e.target.value } : null
                  );
                }}
                placeholder="Enter vendor auth ID"
                disabled // Note: Auth ID cannot be changed as mentioned in UI
                className="bg-gray-50"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-lg border-b pb-2 mb-4">
            Status Management
          </h3>
          <div>
            <Label htmlFor="edit-status">Status</Label>
            <Select
              key="edit-status-select"
              value={selectedEnquiry.status}
              onValueChange={(value) => {
                setSelectedEnquiry(prev => 
                  prev ? { ...prev, status: value as VendorEnquiryStatus } : null
                );
              }}
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
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vendor Enquiries</h1>
          <p className="text-muted-foreground">Manage vendor enquiries and their status</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Enquiry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={VendorEnquiryStatus.NEW}>New</SelectItem>
            <SelectItem value={VendorEnquiryStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={VendorEnquiryStatus.COMPLETED}>Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Table */}
      <motion.div layout className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Auth ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading enquiries...</p>
                </TableCell>
              </TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchQuery || statusFilter !== "all" 
                      ? "No enquiries match your filters"
                      : "No enquiries found"
                    }
                  </div>
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
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="font-medium">{enquiry.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>{enquiry.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>{enquiry.phoneNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground font-mono">
                      {enquiry.authId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(enquiry.status)}>
                      {enquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(enquiry.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(enquiry.createdAt), "h:mm a")}
                    </div>
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

      {/* FIXED: Add Dialog with dedicated form component */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor Enquiry</DialogTitle>
            <DialogDescription>
              Create a new vendor enquiry with contact information and auth ID.
            </DialogDescription>
          </DialogHeader>
          <AddEnquiryFormFields />
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

      {/* FIXED: Edit Dialog with dedicated form component */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor Enquiry</DialogTitle>
            <DialogDescription>
              Update the vendor enquiry information. Note: Auth ID cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <EditEnquiryFormFields />
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
            <DialogTitle>Delete Vendor Enquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p><strong>Name:</strong> {selectedEnquiry.name}</p>
              <p><strong>Email:</strong> {selectedEnquiry.email}</p>
              <p><strong>Phone:</strong> {selectedEnquiry.phoneNumber}</p>
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