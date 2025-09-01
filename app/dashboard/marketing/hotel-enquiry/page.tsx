"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  fetchHotelEnquiries,
  createHotelEnquiry,
  updateHotelEnquiry,
  deleteHotelEnquiry,
  HotelEnquiry,
} from "@/lib/redux/features/hotelEnquirySlice";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Search,
  Loader2,
  MoreHorizontal,
  Building,
  Phone,
  Mail,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Import Textarea from shadcn/ui or your own component
import { Textarea } from "@/components/ui/textarea";
import { fetchHotels, selectHotels } from "@/lib/redux/features/hotelSlice";

const initialHotelEnquiryState: Omit<
  HotelEnquiry,
  "id" | "createdAt" | "updatedAt"
> = {
  name: "",
  email: "",
  phoneNumber: "",
  authId: "",
  status: "Pending",
  message: "",
};

function getStatusColor(status: HotelEnquiry["status"]): string {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Contacted":
      return "bg-blue-100 text-blue-800";
    case "Closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Reusable Form Component for Hotel Enquiry
type HotelEnquiryFormFieldsProps = {
  data: HotelEnquiry | Omit<HotelEnquiry, "id" | "createdAt" | "updatedAt">;
  setData: React.Dispatch<React.SetStateAction<any>>;
  isEditing?: boolean;
};

const HotelEnquiryFormFields = ({
  data,
  setData,
  isEditing = false,
}: HotelEnquiryFormFieldsProps) => (
  <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="Enter name"
          disabled
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder="Enter email"
          disabled
        />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={data.phoneNumber}
          onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
          placeholder="Enter phone number"
          disabled
        />
      </div>
      <div>
        <Label htmlFor="authId">Hotel Auth ID</Label>
        <Input
          id="authId"
          value={data.authId}
          onChange={(e) => setData({ ...data, authId: e.target.value })}
          placeholder="Enter hotel authentication ID"
          disabled
        />
      </div>
    </div>
    <div>
      <Label htmlFor="message">Message</Label>
      <Textarea
        id="message"
        value={data.message || ""}
        onChange={(e) => setData({ ...data, message: e.target.value })}
        placeholder="Enter message"
        rows={4}
        disabled={!isEditing && !("message" in data)}
      />
    </div>
    <div>
      <Label htmlFor="status">Status</Label>
      <Select
        value={data.status}
        onValueChange={(value: string) => setData({ ...data, status: value })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Contacted">Contacted</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default function HotelEnquiryPage() {
  const dispatch = useAppDispatch();
  const { enquiries, loading } = useAppSelector((state) => state.hotelEnquiry);
  const hotels = useAppSelector(selectHotels);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<HotelEnquiry | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newEnquiry, setNewEnquiry] = useState(initialHotelEnquiryState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchHotelEnquiries());
    dispatch(fetchHotels());
  }, [dispatch]);

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchLower) ||
      enquiry.email.toLowerCase().includes(searchLower) ||
      enquiry.phoneNumber.toLowerCase().includes(searchLower) ||
      enquiry.authId.toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = async () => {
    if (
      !newEnquiry.name.trim() ||
      !newEnquiry.email.trim() ||
      !newEnquiry.phoneNumber.trim() ||
      !newEnquiry.authId.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createHotelEnquiry(newEnquiry)).unwrap();
      setIsAddDialogOpen(false);
      setNewEnquiry(initialHotelEnquiryState);
      toast.success("Hotel enquiry added successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEnquiry) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        // Only allow updating message and status
        message: selectedEnquiry.message,
        status: selectedEnquiry.status,
      };
      await dispatch(
        updateHotelEnquiry({
          id: selectedEnquiry.id,
          data: updateData,
        })
      ).unwrap();
      setIsEditDialogOpen(false);
      toast.success("Hotel enquiry updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEnquiry) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteHotelEnquiry(selectedEnquiry.id)).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedEnquiry(null);
      toast.success("Hotel enquiry deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: enquiries.length,
      pending: enquiries.filter((e) => e.status === "Pending").length,
      contacted: enquiries.filter((e) => e.status === "Contacted").length,
      closed: enquiries.filter((e) => e.status === "Closed").length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const getHotelName = (authId: string) => {
    if (!hotels || (Array.isArray(hotels) && hotels.length === 0)) {
      return "Unknown Hotel";
    }
    const hotel = (hotels as any[]).find((v: any) => String(v?.id) == String(authId));
    return hotel?.name || "Unknown Hotel";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hotel Enquiries</h1>
          <p className="text-muted-foreground">
            Manage hotel enquiries and track their status
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Enquiry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Enquiries</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.pending}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">Contacted</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.contacted}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-sm font-medium">Closed</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.closed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, or auth ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Building className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No enquiries found</p>
                    {searchQuery || statusFilter !== "all" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEnquiries.map((enquiry) => (
                <motion.tr
                  key={enquiry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{getHotelName(enquiry.authId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{enquiry.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{enquiry.phoneNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {getHotelName(enquiry.authId)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(enquiry.status)}>
                      {enquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {enquiry.createdAt
                      ? format(new Date(enquiry.createdAt), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {enquiry.updatedAt
                      ? format(new Date(enquiry.updatedAt), "MMM d, yyyy")
                      : "-"}
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
                        {/* <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Hotel Enquiry</DialogTitle>
            <DialogDescription>
              Create a new hotel enquiry in the system. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <HotelEnquiryFormFields data={newEnquiry} setData={setNewEnquiry} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hotel Enquiry</DialogTitle>
            <DialogDescription>
              Only message and status can be updated.
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <HotelEnquiryFormFields
              data={selectedEnquiry}
              setData={setSelectedEnquiry}
              isEditing={true}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
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
              Are you sure you want to delete this hotel enquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium">{selectedEnquiry.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedEnquiry.email}</p>
                <p className="text-sm text-muted-foreground">{selectedEnquiry.phoneNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Auth ID: {getHotelName(selectedEnquiry.authId)}
                </p>
              </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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