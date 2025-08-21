"use client";

import { useState } from "react";
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
  Users,
  Calendar,
  Star, // Premium icon
} from "lucide-react";

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

type HotelEnquiry = {
  id: string;
  hotelName: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  status: "Pending" | "isPremium";
  createdAt: string;
  updatedAt: string;
};

const mockHotelEnquiries: HotelEnquiry[] = [
  {
    id: "1",
    hotelName: "The Grand Palace",
    city: "Jaipur",
    contactName: "Anjali Verma",
    contactEmail: "anjali.v@email.com",
    contactPhone: "9988776655",
    eventType: "Wedding",
    eventDate: "2024-12-15",
    guestCount: 300,
    status: "isPremium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    hotelName: "Sea Breeze Resort",
    city: "Goa",
    contactName: "Sameer Khan",
    contactEmail: "sameer.k@email.com",
    contactPhone: "9112233445",
    eventType: "Corporate Event",
    eventDate: "2024-11-20",
    guestCount: 150,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialHotelEnquiryState: Omit<
  HotelEnquiry,
  "id" | "createdAt" | "updatedAt"
> = {
  hotelName: "",
  city: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  eventType: "Wedding",
  eventDate: "",
  guestCount: 100,
  status: "Pending",
};

export default function HotelEnquiryPage() {
  const [enquiries, setEnquiries] =
    useState<HotelEnquiry[]>(mockHotelEnquiries);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<HotelEnquiry | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newEnquiry, setNewEnquiry] = useState(initialHotelEnquiryState);

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      enquiry.hotelName.toLowerCase().includes(searchLower) ||
      enquiry.contactName.toLowerCase().includes(searchLower) ||
      enquiry.city.toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: HotelEnquiry["status"]): string => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "isPremium":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAdd = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newEntry = {
        ...newEnquiry,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEnquiries((prev) => [newEntry, ...prev]);
      setIsLoading(false);
      setIsAddDialogOpen(false);
      setNewEnquiry(initialHotelEnquiryState);
      toast.success("Hotel enquiry added successfully!");
    }, 500);
  };

  const handleUpdate = () => {
    if (!selectedEnquiry) return;
    setIsLoading(true);
    setTimeout(() => {
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === selectedEnquiry.id
            ? { ...selectedEnquiry, updatedAt: new Date().toISOString() }
            : e
        )
      );
      setIsLoading(false);
      setIsEditDialogOpen(false);
      toast.success("Hotel enquiry updated successfully!");
    }, 500);
  };

  const handleDelete = () => {
    if (!selectedEnquiry) return;
    setIsLoading(true);
    setTimeout(() => {
      setEnquiries((prev) => prev.filter((e) => e.id !== selectedEnquiry.id));
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      toast.success("Hotel enquiry deleted successfully!");
    }, 500);
  };

  type HotelEnquiryFormFieldsProps = {
    data: HotelEnquiry | Omit<HotelEnquiry, "id" | "createdAt" | "updatedAt">;
    setData: React.Dispatch<React.SetStateAction<any>>;
  };
  const HotelEnquiryFormFields = ({
    data,
    setData,
  }: HotelEnquiryFormFieldsProps) => (
    <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hotelName">Hotel Name</Label>
          <Input
            id="hotelName"
            value={data.hotelName}
            onChange={(e) => setData({ ...data, hotelName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            value={data.contactName}
            onChange={(e) => setData({ ...data, contactName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            value={data.contactPhone}
            onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          value={data.contactEmail}
          onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="eventType">Event Type</Label>
          <Select
            value={data.eventType}
            onValueChange={(value) => setData({ ...data, eventType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Corporate Event">Corporate Event</SelectItem>
              <SelectItem value="Birthday Party">Birthday Party</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="eventDate">Event Date</Label>
          <Input
            id="eventDate"
            type="date"
            value={data.eventDate}
            onChange={(e) => setData({ ...data, eventDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="guestCount">Guest Count</Label>
          <Input
            id="guestCount"
            type="number"
            value={data.guestCount}
            onChange={(e) =>
              setData({ ...data, guestCount: Number(e.target.value) })
            }
          />
        </div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={data.status}
          onValueChange={(value: HotelEnquiry["status"]) =>
            setData({ ...data, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="isPremium">isPremium</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Hotel Enquiries</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Enquiry
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by hotel, contact name, city..."
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
            <SelectItem value="isPremium">isPremium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <motion.div layout className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel / City</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Event Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No enquiries found
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
                    <div className="font-medium">{enquiry.hotelName}</div>
                    <div className="text-sm text-muted-foreground">
                      {enquiry.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{enquiry.contactName}</div>
                    <div className="text-sm text-muted-foreground">
                      {enquiry.contactEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(enquiry.eventDate), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {enquiry.guestCount} Guests
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(enquiry.status)}>
                      {enquiry.status === "isPremium" && (
                        <Star className="w-3 h-3 mr-1.5 fill-current" />
                      )}
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Hotel Enquiry</DialogTitle>
          </DialogHeader>
          <HotelEnquiryFormFields data={newEnquiry} setData={setNewEnquiry} />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hotel Enquiry</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <HotelEnquiryFormFields
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
