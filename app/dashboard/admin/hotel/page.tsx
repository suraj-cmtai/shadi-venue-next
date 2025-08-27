"use client";
// dashboard/admin/hotel/page.tsx
import { AppDispatch } from '@/lib/redux/store';
import { 
  selectHotels, 
  selectHotelLoading, 
  selectHotelError,
  fetchHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  type Hotel
} from '@/lib/redux/features/hotelSlice';
import { uploadImageClient, uploadPDFClient } from '@/lib/firebase-client';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from "react-redux";
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
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from 'next/link';



// Helper: Upload a single file and return its URL
async function uploadFile(file: File): Promise<string> {
  try {
    if (file.type.startsWith('image/')) {
      return await uploadImageClient(file);
    } else if (file.type === 'application/pdf') {
      return await uploadPDFClient(file);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error: any) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Helper: Upload multiple files and return their URLs
async function uploadFiles(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadFile(file));
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    throw new Error(`Failed to upload files: ${error.message}`);
  }
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
  googleLocation: string; 
  // Additional form fields
  firstName: string;
  lastName: string;
  companyName: string;
  venueType: string;
  position: string;
  websiteLink: string;
  offerWeddingPackages: 'Yes' | 'No';
  resortCategory: string;
  weddingPackagePrice: string;
  servicesOffered: string;
  maxGuestCapacity: string;
  numberOfRooms: string;
  venueAvailability: string;
  allInclusivePackages: string;
  staffAccommodation: string;
  diningOptions: string;
  otherAmenities: string;
  bookingLeadTime: string;
  preferredContactMethod: string;
  weddingDepositRequired: string;
  refundPolicy: string;
  referralSource: string;
  partnershipInterest: string;

  // File uploads
  uploadResortPhotos: File[];
  uploadMarriagePhotos: File[];
  uploadWeddingBrochure: File[];
  uploadCancelledCheque: File[];

  // Terms
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  signature: string;
  isPremium: boolean;
  isFeatured: boolean;
}

const initialFormState: HotelFormState = {
  name: "",
  category: "Resort",
  location: {
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
  },
  priceRange: {
    startingPrice: 5000,
    currency: "INR",
  },
  rating: 4.0,
  status: "draft",
  description: "",
  amenities: "WiFi, Pool, Restaurant, Parking",
  rooms: [],
  images: [],
  imageFiles: [],
  contactInfo: {
    phone: "",
    email: "",
    website: "",
  },
  policies: {
    checkIn: "14:00",
    checkOut: "11:00",
    cancellation: "Free cancellation up to 24 hours before check-in",
  },
  googleLocation: "",
  // Additional fields with defaults
  firstName: "",
  lastName: "",
  companyName: "",
  venueType: "Hotel Resort",
  position: "Manager",
  websiteLink: "",
  offerWeddingPackages: "Yes",
  resortCategory: "Luxury",
  weddingPackagePrice: "50000",
  servicesOffered: "Wedding Planning, Catering, Photography",
  maxGuestCapacity: "200",
  numberOfRooms: "50",
  venueAvailability: "Year Round",
  allInclusivePackages: "Yes",
  staffAccommodation: "Yes",
  diningOptions: "Multi-cuisine Restaurant, Bar, Room Service",
  otherAmenities: "Spa, Gym, Conference Hall",
  bookingLeadTime: "30 days",
  preferredContactMethod: "Email",
  weddingDepositRequired: "30%",
  refundPolicy: "Full refund if cancelled 30 days prior",
  referralSource: "Website",
  partnershipInterest: "High",

  // File uploads
  uploadResortPhotos: [],
  uploadMarriagePhotos: [],
  uploadWeddingBrochure: [],
  uploadCancelledCheque: [],

  // Terms
  agreeToTerms: false,
  agreeToPrivacy: false,
  signature: "",
  isPremium: false,
  isFeatured: false,
};

const statusColors: Record<Hotel["status"], string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

// Define valid sort keys type
  type SortKey = 'name' | 'category' | 'rating' | 'status' | 'createdAt' | 'updatedAt' | 'city' | 'country' | 'startingPrice' | 'currency';

export default function HotelDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const hotels = useSelector(selectHotels);
  const isLoading = useSelector(selectHotelLoading);
  const error = useSelector(selectHotelError);  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [newHotelForm, setNewHotelForm] = useState<HotelFormState>(initialFormState);
  const [editHotelForm, setEditHotelForm] = useState<HotelFormState>(initialFormState);
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
  }, [newHotelForm.imageFiles, newHotelForm.images]);

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
  }, [editHotelForm?.imageFiles, editHotelForm?.images]);

  const filteredAndSortedHotels = useMemo(() => {
    // Ensure hotels is an array and has items
    if (!Array.isArray(hotels)) {
      console.warn('hotels is not an array:', hotels);
      return [];
    }

    let result = hotels.filter(
      (hotel) =>
        (hotel?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hotel?.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hotel?.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hotel?.location?.country || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let aValue: string | number | undefined;
      let bValue: string | number | undefined;

      // Handle nested fields with safe access
      if (sortBy === "city") {
        aValue = a.location?.city || "";
        bValue = b.location?.city || "";
      } else if (sortBy === "country") {
        aValue = a.location?.country || "";
        bValue = b.location?.country || "";
      } else if (sortBy === "startingPrice") {
        aValue = a.priceRange?.startingPrice || 0;
        bValue = b.priceRange?.startingPrice || 0;
      } else if (sortBy === "currency") {
        aValue = a.priceRange?.currency || "INR";
        bValue = b.priceRange?.currency || "INR";
      } else {
        aValue = (a as any)[sortBy];
        bValue = (b as any)[sortBy];
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Special handling for date fields
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          const aDate = new Date(aValue).getTime();
          const bDate = new Date(bValue).getTime();
          return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      // Fallback: keep original order
      return 0;
    });
    return result;
  }, [hotels, searchQuery, sortBy, sortOrder]);

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
    if (editHotelForm.imageFiles.length > 0) {
      editHotelForm.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    }
    setEditHotelForm(initialFormState);
    setSelectedHotelId(null);
  };

  // Create request data with uploaded file URLs
  // Updated createRequestData function for your hotel dashboard
const createRequestData = async (form: HotelFormState) => {
  try {
    // Upload all files first
    const [
      imageUrls,
      resortPhotoUrls,
      marriagePhotoUrls,
      weddingBrochureUrls,
      cancelledChequeUrls
    ] = await Promise.all([
      uploadFiles(form.imageFiles),
      uploadFiles(form.uploadResortPhotos),
      uploadFiles(form.uploadMarriagePhotos),
      uploadFiles(form.uploadWeddingBrochure),
      uploadFiles(form.uploadCancelledCheque)
    ]);

    // Create FormData object
    const formData = new FormData();
    
    // Basic hotel information
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('rating', form.rating.toString());
    formData.append('status', form.status);
    // Send amenities as array elements
    form.amenities.split(',').map((s) => s.trim()).filter(Boolean).forEach((amenity) => {
      formData.append('amenities', amenity);
    });
    formData.append('servicesOffered', form.servicesOffered);
    formData.append('allInclusivePackages', form.allInclusivePackages);
    formData.append('staffAccommodation', form.staffAccommodation);
    formData.append('diningOptions', form.diningOptions);
    formData.append('otherAmenities', form.otherAmenities);
    formData.append('preferredContactMethod', form.preferredContactMethod);
        
    // Location - use nested field names to match API expectation
    formData.append('location[address]', form.location.address);
    formData.append('location[city]', form.location.city);
    formData.append('location[state]', form.location.state);
    formData.append('location[country]', form.location.country);
    formData.append('location[zipCode]', form.location.zipCode);
    
    // Price Range - use nested field names
    formData.append('priceRange[startingPrice]', form.priceRange.startingPrice.toString());
    formData.append('priceRange[currency]', form.priceRange.currency);
    
    // Contact Info - use nested field names
    formData.append('contactInfo[phone]', form.contactInfo.phone);
    formData.append('contactInfo[email]', form.contactInfo.email);
    formData.append('contactInfo[website]', form.contactInfo.website || "");
    
    // Policies - use nested field names
    formData.append('policies[checkIn]', form.policies.checkIn);
    formData.append('policies[checkOut]', form.policies.checkOut);
    formData.append('policies[cancellation]', form.policies.cancellation);
    
    // Additional fields - Personal/Business Information
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('companyName', form.companyName);
    formData.append('venueType', form.venueType);
    formData.append('position', form.position);
    formData.append('websiteLink', form.websiteLink);
    
    // Wedding and Venue Information
    formData.append('offerWeddingPackages', form.offerWeddingPackages);
    formData.append('resortCategory', form.resortCategory);
    formData.append('weddingPackagePrice', form.weddingPackagePrice);
    formData.append('maxGuestCapacity', form.maxGuestCapacity);
    formData.append('numberOfRooms', form.numberOfRooms);
    formData.append('venueAvailability', form.venueAvailability);
    
    // Services and Amenities
    // formData.append('servicesOffered', form.servicesOffered);
    // formData.append('allInclusivePackages', form.allInclusivePackages);
    // formData.append('staffAccommodation', form.staffAccommodation);
    // formData.append('diningOptions', form.diningOptions);
    // formData.append('otherAmenities', form.otherAmenities);
    
    // Business and Booking Information
    formData.append('bookingLeadTime', form.bookingLeadTime);
    // formData.append('preferredContactMethod', form.preferredContactMethod);
    formData.append('weddingDepositRequired', form.weddingDepositRequired);
    formData.append('refundPolicy', form.refundPolicy);
    formData.append('referralSource', form.referralSource);
    formData.append('partnershipInterest', form.partnershipInterest);
    
    // Legal and Agreement Fields
    formData.append('agreeToTerms', form.agreeToTerms.toString());
    formData.append('agreeToPrivacy', form.agreeToPrivacy.toString());
    formData.append('signature', form.signature);
    formData.append('googleLocation', form.googleLocation);
    formData.append('isPremium', form.isPremium.toString());
    formData.append('isFeatured', form.isFeatured.toString());
    
    // Rooms as JSON string
    formData.append('rooms', JSON.stringify(form.rooms));

    // File URLs - append as indexed arrays
    imageUrls.forEach((url, index) => {
      formData.append(`images[${index}]`, url);
    });
    
    resortPhotoUrls.forEach((url, index) => {
      formData.append(`uploadResortPhotos[${index}]`, url);
    });
    
    marriagePhotoUrls.forEach((url, index) => {
      formData.append(`uploadMarriagePhotos[${index}]`, url);
    });
    
    weddingBrochureUrls.forEach((url, index) => {
      formData.append(`uploadWeddingBrochure[${index}]`, url);
    });
    
    cancelledChequeUrls.forEach((url, index) => {
      formData.append(`uploadCancelledCheque[${index}]`, url);
    });

    return formData;
  } catch (error: any) {
    throw new Error(`Failed to prepare request data: ${error.message}`);
  }
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
      toast.loading("Uploading files and creating hotel...");
      const data = await createRequestData(newHotelForm);
      await dispatch(createHotel(data)).unwrap();
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
    if (!selectedHotelId || isSubmitting) return;

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
      toast.loading("Uploading files and updating hotel...");
      const data = await createRequestData(editHotelForm);
      await dispatch(updateHotel({ id: selectedHotelId, data })).unwrap();
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
      const hotel = hotels.find((h: Hotel) => h.id === hotelId);
      if (!hotel) return;
      
      const formData = new FormData();
      formData.append('status', newStatus);
      
      await dispatch(updateHotel({ id: hotelId, data: formData })).unwrap();
      toast.success(`Hotel status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update hotel status');
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
      default:
        return null;
    }
  };
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formState: HotelFormState,
    setFormState: React.Dispatch<React.SetStateAction<HotelFormState>>
  ) => {
    const files = Array.from(e.target.files || []);
    
    // Clean up existing blob URLs
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
      
      // Create new blob URLs for preview
      const newObjectUrls = files.map((file) => URL.createObjectURL(file));
      
      setFormState((prev: HotelFormState) => ({
        ...prev,
        imageFiles: files,
        images: newObjectUrls,
      }));
    } else {
      setFormState((prev: HotelFormState) => ({
        ...prev,
        imageFiles: [],
        images: [],
      }));
    }
  };

  const removeImage = (
    index: number,
    formState: HotelFormState,
    setFormState: React.Dispatch<React.SetStateAction<HotelFormState>>
  ) => {
    const imageUrl = formState.images[index];
    
    // Revoke blob URL if it exists
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    
    setFormState((prev: HotelFormState) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  // Render all form fields
  const renderFormFields = (
    form: HotelFormState,
    setForm: React.Dispatch<React.SetStateAction<HotelFormState>>
  ) => {
    return (
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="First Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Last Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Venue Type</Label>
              <Input
                value={form.venueType}
                onChange={(e) => setForm((prev) => ({ ...prev, venueType: e.target.value }))}
                placeholder="Venue Type"
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                placeholder="Your Position"
              />
            </div>
            <div className="space-y-2">
              <Label>Website Link</Label>
              <Input
                value={form.websiteLink}
                onChange={(e) => setForm((prev) => ({ ...prev, websiteLink: e.target.value }))}
                placeholder="Website URL"
              />
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hotel Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hotel Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Hotel Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Hotel Category"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Hotel Description"
              />
            </div>
            <div className="space-y-2">
              <Label>Resort Category</Label>
              <Input
                value={form.resortCategory}
                onChange={(e) => setForm((prev) => ({ ...prev, resortCategory: e.target.value }))}
                placeholder="Resort Category"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                value={form.location.address}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
                placeholder="Street Address"
              />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                value={form.location.city}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value }
                }))}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={form.location.state}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, state: e.target.value }
                }))}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label>Country *</Label>
              <Input
                value={form.location.country}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, country: e.target.value }
                }))}
                placeholder="Country"
              />
            </div>
            <div className="space-y-2">
              <Label>Zip Code</Label>
              <Input
                value={form.location.zipCode}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, zipCode: e.target.value }
                }))}
                placeholder="Zip Code"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pricing & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Starting Price</Label>
              <Input
                type="number"
                value={form.priceRange.startingPrice}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, startingPrice: Number(e.target.value) },
                  }))
                }
                placeholder="Starting Price"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={form.priceRange.currency}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, currency: value as HotelFormState["priceRange"]["currency"] },
                  }))
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
            <div className="space-y-2">
              <Label>Rating</Label>
              <Input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    rating: Number(e.target.value),
                  }))
                }
                placeholder="Rating"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value as HotelFormState["status"],
                  }))
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
            <div className="space-y-2">
              <Label>Premium</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isPremium}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPremium: e.target.checked }))}
                />
                <span className="text-sm text-muted-foreground">Mark as premium</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Featured</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                />
                <span className="text-sm text-muted-foreground">Mark as featured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wedding Package Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Wedding Package Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Offer Wedding Packages</Label>
              <Select
                value={form.offerWeddingPackages}
                onValueChange={(value) => setForm((prev) => ({
                  ...prev,
                  offerWeddingPackages: value as 'Yes' | 'No'
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Wedding Package Price</Label>
              <Input
                value={form.weddingPackagePrice}
                onChange={(e) => setForm((prev) => ({ ...prev, weddingPackagePrice: e.target.value }))}
                placeholder="Package Price"
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Guest Capacity</Label>
              <Input
                value={form.maxGuestCapacity}
                onChange={(e) => setForm((prev) => ({ ...prev, maxGuestCapacity: e.target.value }))}
                placeholder="Max Guests"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Rooms</Label>
              <Input
                value={form.numberOfRooms}
                onChange={(e) => setForm((prev) => ({ ...prev, numberOfRooms: e.target.value }))}
                placeholder="Number of Rooms"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Images</h3>
            <div className="space-y-2">
              <Label>Hotel Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e, form, setForm)}
              />
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {form.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md object-cover w-full h-24"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        onClick={() => removeImage(index, form, setForm)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>


        {/* Additional File Uploads */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resort Photos</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setForm((prev) => ({ ...prev, uploadResortPhotos: files }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Marriage Photos</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setForm((prev) => ({ ...prev, uploadMarriagePhotos: files }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Wedding Brochure</Label>
              <Input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setForm((prev) => ({ ...prev, uploadWeddingBrochure: files }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Cancelled Cheque</Label>
              <Input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setForm((prev) => ({ ...prev, uploadCancelledCheque: files }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Services and Amenities */}
        <div className="space-y-4">
  <h3 className="text-lg font-medium">Package & Accommodation Options</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="space-y-2">
      <Label>All-Inclusive Packages</Label>
      <Select
        value={form.allInclusivePackages}
        onValueChange={(value) => setForm((prev) => ({ ...prev, allInclusivePackages: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Yes">Yes</SelectItem>
          <SelectItem value="No">No</SelectItem>
          <SelectItem value="Partially">Partially</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div className="space-y-2">
      <Label>Staff Accommodation</Label>
      <Select
        value={form.staffAccommodation}
        onValueChange={(value) => setForm((prev) => ({ ...prev, staffAccommodation: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Yes">Yes</SelectItem>
          <SelectItem value="No">No</SelectItem>
          <SelectItem value="Limited">Limited</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div className="space-y-2">
      <Label>Preferred Contact Method</Label>
      <Select
        value={form.preferredContactMethod}
        onValueChange={(value) => setForm((prev) => ({ ...prev, preferredContactMethod: value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Email">Email</SelectItem>
          <SelectItem value="Phone">Phone</SelectItem>
          <SelectItem value="Direct Message (Website)">Direct Message (Website)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Services and Amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Services Offered</Label>
              <Textarea
                value={form.servicesOffered}
                onChange={(e) => setForm((prev) => ({ ...prev, servicesOffered: e.target.value }))}
                placeholder="List services offered"
              />
            </div>
            <div className="space-y-2">
              <Label>Dining Options</Label>
              <Textarea
                value={form.diningOptions}
                onChange={(e) => setForm((prev) => ({ ...prev, diningOptions: e.target.value }))}
                placeholder="Dining options available"
              />
            </div>
            <div className="space-y-2">
              <Label>Other Amenities</Label>
              <Textarea
                value={form.otherAmenities}
                onChange={(e) => setForm((prev) => ({ ...prev, otherAmenities: e.target.value }))}
                placeholder="Additional amenities"
              />
            </div>
            <div className="space-y-2">
              <Label>Venue Availability</Label>
              <Input
                value={form.venueAvailability}
                onChange={(e) => setForm((prev) => ({ ...prev, venueAvailability: e.target.value }))}
                placeholder="Availability schedule"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Amenities</h3>
          <div className="space-y-2">
            <Label>Amenities (comma separated)</Label>
            <Input
              value={form.amenities}
              onChange={(e) => setForm((prev) => ({ ...prev, amenities: e.target.value }))}
              placeholder="WiFi, Pool, Spa, Parking"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.contactInfo.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, phone: e.target.value },
                  }))
                }
                placeholder="Phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.contactInfo.email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, email: e.target.value },
                  }))
                }
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={form.contactInfo.website}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, website: e.target.value },
                  }))
                }
                placeholder="Website"
              />
            </div>
            <div className="space-y-2 md:col-span-2"> {/* ADD THIS ENTIRE DIV */}
              <Label>Google Maps Location</Label>
              <Textarea
                value={form.googleLocation}
                onChange={(e) => {
                  const input = e.target.value;
                  // Extract URL from iframe embed code if present
                  const regex = /src="([^"]*google\.com\/maps\/embed[^"]*)"/;
                  const match = input.match(regex);
                  const extractedUrl = match ? match[1] : input;
                  setForm((prev) => ({ ...prev, googleLocation: extractedUrl }));
                }}
                placeholder="Paste Google Maps embed code or URL here"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                You can paste the full iframe embed code or just the URL
              </p>
            </div>
            <div className="space-y-2">
              <Label>Preferred Contact Method</Label>
              <Input
                value={form.preferredContactMethod}
                onChange={(e) => setForm((prev) => ({ ...prev, preferredContactMethod: e.target.value }))}
                placeholder="Email, Phone, etc."
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Booking Lead Time</Label>
              <Input
                value={form.bookingLeadTime}
                onChange={(e) => setForm((prev) => ({ ...prev, bookingLeadTime: e.target.value }))}
                placeholder="Booking lead time required"
              />
            </div>
            <div className="space-y-2">
              <Label>Wedding Deposit Required</Label>
              <Input
                value={form.weddingDepositRequired}
                onChange={(e) => setForm((prev) => ({ ...prev, weddingDepositRequired: e.target.value }))}
                placeholder="Deposit percentage or amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Referral Source</Label>
              <Input
                value={form.referralSource}
                onChange={(e) => setForm((prev) => ({ ...prev, referralSource: e.target.value }))}
                placeholder="How did you hear about us?"
              />
            </div>
            <div className="space-y-2">
              <Label>Partnership Interest</Label>
              <Input
                value={form.partnershipInterest}
                onChange={(e) => setForm((prev) => ({ ...prev, partnershipInterest: e.target.value }))}
                placeholder="Interest level in partnership"
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-In</Label>
              <Input
                value={form.policies.checkIn}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    policies: { ...prev.policies, checkIn: e.target.value },
                  }))
                }
                placeholder="Check-In Time"
              />
            </div>
            <div className="space-y-2">
              <Label>Check-Out</Label>
              <Input
                value={form.policies.checkOut}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    policies: { ...prev.policies, checkOut: e.target.value },
                  }))
                }
                placeholder="Check-Out Time"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Cancellation Policy</Label>
              <Textarea
                value={form.policies.cancellation}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    policies: { ...prev.policies, cancellation: e.target.value },
                  }))
                }
                placeholder="Cancellation Policy"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Refund Policy</Label>
              <Textarea
                value={form.refundPolicy}
                onChange={(e) => setForm((prev) => ({ ...prev, refundPolicy: e.target.value }))}
                placeholder="Refund policy details"
              />
            </div>
          </div>
        </div>

        {/* Terms and Agreement */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Terms and Agreement</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.agreeToTerms}
                onChange={(e) => setForm((prev) => ({ ...prev, agreeToTerms: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label>I agree to the <Link href="/terms-and-conditions">terms and conditions</Link></Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.agreeToPrivacy}
                onChange={(e) => setForm((prev) => ({ ...prev, agreeToPrivacy: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label>I agree to the <Link href="/privacy-policy">Privacy Policy *</Link></Label>
            </div>
            <div className="space-y-2">
              <Label>Digital Signature</Label>
              <Input
                value={form.signature}
                onChange={(e) => setForm((prev) => ({ ...prev, signature: e.target.value }))}
                placeholder="Type your full name as signature"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                <TableHead className="min-w-[90px]">Premium</TableHead>
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
              ) : filteredAndSortedHotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No hotels found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedHotels.map((hotel: Hotel) => (
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
                      {hotel.location?.city || 'N/A'}, {hotel.location?.country || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {hotel.priceRange ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: hotel.priceRange.currency || 'INR'
                      }).format(hotel.priceRange.startingPrice || 0) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{(hotel.rating || 0).toFixed(1)}</TableCell>
                    <TableCell className="text-muted-foreground">{(hotel as any).isPremium ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(hotel.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[hotel.status]}`}
                        >
                          {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                        </span>
                      </div>
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
                              const hotelForEdit: HotelFormState = {
                                name: hotel.name || "",
                                category: hotel.category || "",
                                location: hotel.location || initialFormState.location,
                                priceRange: hotel.priceRange || initialFormState.priceRange,
                                rating: hotel.rating || 0,
                                status: hotel.status || "draft",
                                description: hotel.description || "",
                                amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : (hotel.amenities || ""),
                                servicesOffered: Array.isArray(hotel.servicesOffered) 
                                  ? hotel.servicesOffered.join(", ") 
                                  : (hotel.servicesOffered || ""),
                                diningOptions: Array.isArray(hotel.diningOptions) 
                                  ? hotel.diningOptions.join(", ") 
                                  : (hotel.diningOptions || ""),
                                otherAmenities: Array.isArray(hotel.otherAmenities) 
                                  ? hotel.otherAmenities.join(", ") 
                                  : (hotel.otherAmenities || ""),
                                  allInclusivePackages: typeof hotel.allInclusivePackages === 'string' 
                                  ? hotel.allInclusivePackages 
                                  : (Array.isArray(hotel.allInclusivePackages) 
                                    ? hotel.allInclusivePackages[0] || "Yes"
                                    : "Yes"),
                                    
                                staffAccommodation: typeof hotel.staffAccommodation === 'string'
                                  ? hotel.staffAccommodation
                                  : (Array.isArray(hotel.staffAccommodation) 
                                    ? hotel.staffAccommodation[0] || "Yes"
                                    : "Yes"),
                                    
                                preferredContactMethod: typeof hotel.preferredContactMethod === 'string'
                                  ? hotel.preferredContactMethod
                                  : (Array.isArray(hotel.preferredContactMethod) 
                                    ? hotel.preferredContactMethod[0] || "Email"
                                    : "Email"),
                                rooms: hotel.rooms || [],
                                images: hotel.images || [],
                                imageFiles: [],
                                contactInfo: hotel.contactInfo || initialFormState.contactInfo,
                                policies: hotel.policies || initialFormState.policies,
                                firstName: hotel.firstName || "",
                                lastName: hotel.lastName || "",
                                companyName: hotel.companyName || "",
                                venueType: hotel.venueType || "",
                                position: hotel.position || "",
                                websiteLink: hotel.websiteLink || "",
                                offerWeddingPackages: hotel.offerWeddingPackages || "No",
                                resortCategory: hotel.resortCategory || "",
                                weddingPackagePrice: hotel.weddingPackagePrice || "",
                                // servicesOffered: Array.isArray(hotel.servicesOffered) 
                                //   ? hotel.servicesOffered.join(", ") 
                                //   : hotel.servicesOffered || "",
                                maxGuestCapacity: hotel.maxGuestCapacity || "",
                                numberOfRooms: hotel.numberOfRooms || "",
                                venueAvailability: hotel.venueAvailability || "",
                                // allInclusivePackages: hotel.allInclusivePackages?.toString() || "",
                                // staffAccommodation: hotel.staffAccommodation?.toString() || "",
                                 // diningOptions: Array.isArray(hotel.diningOptions) 
                                //   ? hotel.diningOptions.join(", ") 
                                //   : hotel.diningOptions || "",
                                // otherAmenities: Array.isArray(hotel.otherAmenities) 
                                //   ? hotel.otherAmenities.join(", ") 
                                //   : hotel.otherAmenities || "",
                                bookingLeadTime: hotel.bookingLeadTime || "",
                                // preferredContactMethod: Array.isArray(hotel.preferredContactMethod) 
                                //   ? hotel.preferredContactMethod.join(", ") 
                                //   : hotel.preferredContactMethod || "",
                                weddingDepositRequired: hotel.weddingDepositRequired || "",
                                refundPolicy: hotel.refundPolicy || "",
                                referralSource: hotel.referralSource || "",
                                partnershipInterest: hotel.partnershipInterest || "",
                                uploadResortPhotos: [],
                                uploadMarriagePhotos: [],
                                uploadWeddingBrochure: [],
                                uploadCancelledCheque: [],
                                agreeToTerms: hotel.agreeToTerms || false,
                                agreeToPrivacy: hotel.agreeToPrivacy || false,
                                signature: hotel.signature || "",
                                isPremium: Boolean((hotel as any).isPremium),
                                isFeatured: Boolean((hotel as any).isFeatured),
                                googleLocation: hotel.googleLocation || "", 
                              };
                              setEditHotelForm(hotelForEdit);
                              setSelectedHotelId(hotel.id);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {hotel.status !== 'active' && (
                            <DropdownMenuItem
                              onSelect={() => handleQuickStatusUpdate(hotel.id, 'active')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Active
                            </DropdownMenuItem>
                          )}
                          {hotel.status !== 'draft' && (
                            <DropdownMenuItem
                              onSelect={() => handleQuickStatusUpdate(hotel.id, 'draft')}
                              className="text-yellow-600"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Mark as Draft
                            </DropdownMenuItem>
                          )}
                          {hotel.status !== 'archived' && (
                            <DropdownMenuItem
                              onSelect={() => handleQuickStatusUpdate(hotel.id, 'archived')}
                              className="text-gray-600"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
                disabled={isSubmitting || !editHotelForm.name.trim() || !editHotelForm.description.trim()}
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