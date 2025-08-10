"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  selectHotels,
  selectHotelLoading,
  selectHotelError,
} from "@/lib/redux/features/hotelSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Loader2, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Image as ImageIcon, 
  Plus, 
  Search,
  CheckCircle,
  Archive,
  AlertCircle
} from "lucide-react";
import Image from "next/image";

interface Hotel {
  id: string;
  name: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  priceRange: {
    startingPrice: number;
    currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';
  };
  rating: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
  amenities: string[];
  rooms: {
    type: string;
    capacity: number;
    pricePerNight: number;
    available: number;
  }[];
  images: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HotelFormState {
  name: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  priceRange: {
    startingPrice: number;
    currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';
  };
  rating: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
  amenities: string;
  rooms: {
    type: string;
    capacity: number;
    pricePerNight: number;
    available: number;
  }[];
  images: string[];
  imageFiles: File[];
  removeImages: boolean;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
}

const initialFormState: HotelFormState = {
  name: "",
  category: "",
  location: {
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  priceRange: {
    startingPrice: 0,
    currency: "USD",
  },
  rating: 0,
  status: "draft",
  description: "",
  amenities: "",
  rooms: [],
  images: [],
  imageFiles: [],
  removeImages: false,
  contactInfo: {
    phone: "",
    email: "",
    website: "",
  },
  policies: {
    checkIn: "",
    checkOut: "",
    cancellation: "",
  },
};

const statusColors: Record<Hotel["status"], string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

export default function HotelDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const hotels = useSelector(selectHotels);
  const isLoading = useSelector(selectHotelLoading);
  const error = useSelector(selectHotelError);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newHotelForm, setNewHotelForm] = useState<HotelFormState>(initialFormState);
  const [editHotelForm, setEditHotelForm] = useState<HotelFormState | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  // Clean up object URLs when component unmounts or form changes
  useEffect(() => {
    return () => {
      if (newHotelForm.imageFiles.length > 0) {
        newHotelForm.images.forEach((image) => {
          if (image.startsWith("blob:")) {
            URL.revokeObjectURL(image);
          }
        });
      }
    };
  }, [newHotelForm.imageFiles]);

  useEffect(() => {
    return () => {
      if (editHotelForm?.imageFiles && editHotelForm.imageFiles.length > 0) {
        editHotelForm.images.forEach((image) => {
          if (image.startsWith("blob:")) {
            URL.revokeObjectURL(image);
          }
        });
      }
    };
  }, [editHotelForm?.imageFiles]);

  const filteredHotels = hotels.filter(
    (hotel: Hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetCreateForm = () => {
    if (newHotelForm.imageFiles.length > 0) {
      newHotelForm.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    }
    setNewHotelForm(initialFormState);
  };

  const resetEditForm = () => {
    if (editHotelForm?.imageFiles && editHotelForm.imageFiles.length > 0) {
      editHotelForm.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    }
    setEditHotelForm(null);
    setSelectedHotelId(null);
  };

  const handleCreate = async () => {
    if (isSubmitting) return;

    // Validation
    if (!newHotelForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!newHotelForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!newHotelForm.category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!newHotelForm.location.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!newHotelForm.location.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!newHotelForm.location.country.trim()) {
      toast.error("Country is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", newHotelForm.name.trim());
      formData.append("description", newHotelForm.description.trim());
      formData.append("category", newHotelForm.category.trim());
      formData.append("location", JSON.stringify(newHotelForm.location));
      formData.append("priceRange", JSON.stringify(newHotelForm.priceRange));
      formData.append("rating", newHotelForm.rating.toString());
      formData.append("status", newHotelForm.status);
      formData.append(
        "amenities",
        newHotelForm.amenities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(",")
      );
      formData.append("rooms", JSON.stringify(newHotelForm.rooms));
      formData.append("contactInfo", JSON.stringify(newHotelForm.contactInfo));
      formData.append("policies", JSON.stringify(newHotelForm.policies));

      newHotelForm.imageFiles.forEach((file) => {
        formData.append(`images`, file);
      });

      await dispatch(createHotel(formData)).unwrap();
      resetCreateForm();
      setIsCreateDialogOpen(false);
      toast.success("Hotel created successfully!");
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to create hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editHotelForm || !selectedHotelId || isSubmitting) return;

    // Validation
    if (!editHotelForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editHotelForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!editHotelForm.category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!editHotelForm.location.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!editHotelForm.location.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!editHotelForm.location.country.trim()) {
      toast.error("Country is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", editHotelForm.name.trim());
      formData.append("description", editHotelForm.description.trim());
      formData.append("category", editHotelForm.category.trim());
      formData.append("location", JSON.stringify(editHotelForm.location));
      formData.append("priceRange", JSON.stringify(editHotelForm.priceRange));
      formData.append("rating", editHotelForm.rating.toString());
      formData.append("status", editHotelForm.status);
      formData.append(
        "amenities",
        editHotelForm.amenities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(",")
      );
      formData.append("rooms", JSON.stringify(editHotelForm.rooms));
      formData.append("contactInfo", JSON.stringify(editHotelForm.contactInfo));
      formData.append("policies", JSON.stringify(editHotelForm.policies));

      editHotelForm.imageFiles.forEach((file) => {
        formData.append(`images`, file);
      });

      if (editHotelForm.removeImages) {
        formData.append("removeImages", "true");
      }

      await dispatch(updateHotel({ id: selectedHotelId, data: formData })).unwrap();
      setIsEditDialogOpen(false);
      resetEditForm();
      toast.success("Hotel updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to update hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHotelId || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await dispatch(deleteHotel(selectedHotelId)).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedHotelId(null);
      toast.success("Hotel deleted successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (hotelId: string, newStatus: Hotel["status"]) => {
    try {
      setIsSubmitting(true);
      const hotel = hotels.find(h => h.id === hotelId);
      if (!hotel) return;

      const formData = new FormData();
      formData.append('status', newStatus);
      
      await dispatch(updateHotel({ id: hotelId, data: formData })).unwrap();
      toast.success(`Hotel status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hotel status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: Hotel["status"]) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formState: HotelFormState,
    setFormState: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const files = Array.from(e.target.files || []);
  
    // Clean up previous object URLs
    formState.images.forEach((image) => {
      if (image.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    });
  
    if (files.length > 0) {
      const invalidFiles = files.filter((file) => !file.type.startsWith("image/"));
      if (invalidFiles.length > 0) {
        toast.error("Only image files are allowed");
        return;
      }
  
      const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error("Images must be under 5MB each");
        return;
      }
  
      const objectUrls = files.map((file) => URL.createObjectURL(file));
      setFormState((prev: HotelFormState | null) => {
        if (!prev) return null;
        return {
          ...prev,
          imageFiles: files,
          images: objectUrls,
          removeImages: false,
        };
      });
    } else {
      setFormState((prev: HotelFormState | null) => {
        if (!prev) return null;
        return {
          ...prev,
          imageFiles: [],
          images: [],
        };
      });
    }
  };
  
  const renderFormFields = (
    form: HotelFormState,
    setForm: React.Dispatch<React.SetStateAction<any>>
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((prev: HotelFormState | null) => (prev ? { ...prev, name: e.target.value } : null))}
          placeholder="Hotel Name"
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={form.category}
          onChange={(e) => setForm((prev: HotelFormState | null) => (prev ? { ...prev, category: e.target.value } : null))}
          placeholder="Category"
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={form.location.address}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              location: { ...prev.location, address: e.target.value },
            } : null))
          }
          placeholder="Address"
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={form.location.city}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              location: { ...prev.location, city: e.target.value },
            } : null))
          }
          placeholder="City"
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={form.location.state}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              location: { ...prev.location, state: e.target.value },
            } : null))
          }
          placeholder="State"
        />
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={form.location.country}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              location: { ...prev.location, country: e.target.value },
            } : null))
          }
          placeholder="Country"
        />
      </div>
      <div>
        <Label htmlFor="zipCode">Zip Code</Label>
        <Input
          id="zipCode"
          value={form.location.zipCode}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              location: { ...prev.location, zipCode: e.target.value },
            } : null))
          }
          placeholder="Zip Code"
        />
      </div>
      <div>
        <Label htmlFor="startingPrice">Starting Price</Label>
        <Input
          id="startingPrice"
          type="number"
          value={form.priceRange.startingPrice}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              priceRange: { ...prev.priceRange, startingPrice: Number(e.target.value) },
            } : null))
          }
          placeholder="Starting Price"
        />
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={form.priceRange.currency}
          onValueChange={(value) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              priceRange: { ...prev.priceRange, currency: value as HotelFormState["priceRange"]["currency"] },
            } : null))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {["USD", "EUR", "CAD", "AUD", "GBP", "INR"].map((cur) => (
              <SelectItem key={cur} value={cur}>
                {cur}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="rating">Rating</Label>
        <Input
          id="rating"
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={form.rating}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              rating: Number(e.target.value),
            } : null))
          }
          placeholder="Rating"
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={form.status}
          onValueChange={(value) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              status: value as HotelFormState["status"],
            } : null))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["active", "draft", "archived"].map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((prev: HotelFormState | null) => (prev ? { ...prev, description: e.target.value } : null))}
          placeholder="Description"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="amenities">Amenities (comma separated)</Label>
        <Input
          id="amenities"
          value={form.amenities}
          onChange={(e) => setForm((prev: HotelFormState | null) => (prev ? { ...prev, amenities: e.target.value } : null))}
          placeholder="WiFi, Pool, Spa, Parking"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={form.contactInfo.phone}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              contactInfo: { ...prev.contactInfo, phone: e.target.value },
            } : null))
          }
          placeholder="Phone"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.contactInfo.email}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              contactInfo: { ...prev.contactInfo, email: e.target.value },
            } : null))
          }
          placeholder="Email"
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={form.contactInfo.website}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              contactInfo: { ...prev.contactInfo, website: e.target.value },
            } : null))
          }
          placeholder="Website"
        />
      </div>
      <div>
        <Label htmlFor="checkIn">Check-In</Label>
        <Input
          id="checkIn"
          value={form.policies.checkIn}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              policies: { ...prev.policies, checkIn: e.target.value },
            } : null))
          }
          placeholder="Check-In Time"
        />
      </div>
      <div>
        <Label htmlFor="checkOut">Check-Out</Label>
        <Input
          id="checkOut"
          value={form.policies.checkOut}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              policies: { ...prev.policies, checkOut: e.target.value },
            } : null))
          }
          placeholder="Check-Out Time"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="cancellation">Cancellation Policy</Label>
        <Textarea
          id="cancellation"
          value={form.policies.cancellation}
          onChange={(e) =>
            setForm((prev: HotelFormState | null) => (prev ? {
              ...prev,
              policies: { ...prev.policies, cancellation: e.target.value },
            } : null))
          }
          placeholder="Cancellation Policy"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="images">Images</Label>
        <Input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageChange(e, form, setForm)}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {form.images.map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border">
              <Image
                src={img}
                alt={`Hotel image ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Hotel</span>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background shadow-sm w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="min-w-[120px]">Price</TableHead>
                <TableHead className="min-w-[80px]">Rating</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredHotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No hotels found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHotels.map((hotel: Hotel) => (
                  <TableRow key={hotel.id} className="hover:bg-muted/50">
                    <TableCell className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border flex-shrink-0">
                        {hotel.images?.[0] ? (
                          <Image
                            src={hotel.images[0]}
                            alt={hotel.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium truncate">{hotel.name}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{hotel.category}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {hotel.location.city}, {hotel.location.country}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.NumberFormat('en-US', { style:
                    </TableCell>
                    <TableCell className="text-muted-foreground">{hotel.rating.toFixed(1)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[hotel.status]}`}
                      >
                        {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditHotelForm({
                                ...hotel,
                                amenities: hotel.amenities.join(", "),
                                imageFiles: [],
                                removeImages: false,
                                contactInfo: {
                                  ...hotel.contactInfo,
                                  website: hotel.contactInfo.website ?? "",
                                },
                              });
                              setSelectedHotelId(hotel.id);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onSelect={() => {
                              setSelectedHotelId(hotel.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Hotel</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new hotel. Click create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderFormFields(newHotelForm, setNewHotelForm)}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetCreateForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting || !newHotelForm.name.trim() || !newHotelForm.description.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editHotelForm && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Hotel</DialogTitle>
              <DialogDescription>
                Update the details for this hotel. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {renderFormFields(editHotelForm, setEditHotelForm)}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetEditForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={isSubmitting || !editHotelForm?.name?.trim() || !editHotelForm?.description?.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the hotel and remove its data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedHotelId(null);
              }}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}