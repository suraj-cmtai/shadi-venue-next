"use client";
// dashboard/admin/banquet/page.tsx
import { AppDispatch } from '@/lib/redux/store';
import {
  selectBanquets,
  selectBanquetLoading,
  selectBanquetError,
  fetchBanquets,
  createBanquet,
  updateBanquet,
  deleteBanquet,
  type Banquet
} from '@/lib/redux/features/banquetSlice';
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
import { Switch } from "@/components/ui/switch";
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

interface BanquetFormState {
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
    currency: string;
  };
  rating: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
  amenities: string;
  weddingPackages: { name: string; rooms: number; price: number; totalGuests: number; }[];  
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
  servicesOffered: string;
  maxGuestCapacity: string;
  totalRooms: number;
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

const initialFormState: BanquetFormState = {
  name: "",
  category: "Banquet Hall",
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
  weddingPackages: [],
  totalRooms: 0,
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
  venueType: "Banquet Hall",
  position: "Manager",
  websiteLink: "",
  offerWeddingPackages: "Yes",
  resortCategory: "Premium",
  servicesOffered: "Wedding Planning, Catering, Photography",
  maxGuestCapacity: "200",
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

const statusColors: Record<BanquetFormState["status"], string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

// Define valid sort keys type
  type SortKey = 'name' | 'category' | 'rating' | 'status' | 'createdAt' | 'updatedAt' | 'city' | 'country' | 'startingPrice' | 'currency';

export default function BanquetDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const banquets = useSelector(selectBanquets);
  const isLoading = useSelector(selectBanquetLoading);
  const error = useSelector(selectBanquetError); 
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [newBanquetForm, setNewBanquetForm] = useState<BanquetFormState>(initialFormState);
  const [editBanquetForm, setEditBanquetForm] = useState<BanquetFormState>(initialFormState);
  const [selectedBanquetId, setSelectedBanquetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBanquets());
  }, [dispatch]);

  console.log(banquets);

  // Clean up object URLs when component unmounts or form changes
  useEffect(() => {
    return () => {
      if (newBanquetForm.imageFiles.length > 0) {
        newBanquetForm.images.forEach((image) => {
          if (image.startsWith("blob:")) {
            URL.revokeObjectURL(image);
          }
        });
      }
    };
  }, [newBanquetForm.imageFiles, newBanquetForm.images]);

  useEffect(() => {
    return () => {
      if (editBanquetForm?.imageFiles && editBanquetForm.imageFiles.length > 0) {
        editBanquetForm.images.forEach((image) => {
          if (image.startsWith("blob:")) {
            URL.revokeObjectURL(image);
          }
        });
      }
    };
  }, [editBanquetForm?.imageFiles, editBanquetForm?.images]);

  const filteredAndSortedBanquets = useMemo(() => {
    // Ensure banquets is an array and has items
    if (!Array.isArray(banquets)) {
      console.warn('banquets is not an array:', banquets);
      return [];
    }

    let result = banquets.filter(
      (banquet) =>
        (banquet?.venueName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (banquet?.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (banquet?.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (banquet?.location?.country || '').toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [banquets, searchQuery, sortBy, sortOrder]);

  const resetCreateForm = () => {
    if (newBanquetForm.imageFiles.length > 0) {
      newBanquetForm.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    }
    setNewBanquetForm(initialFormState);
  };

  const resetEditForm = () => {
    if (editBanquetForm.imageFiles.length > 0) {
      editBanquetForm.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    }
    setEditBanquetForm(initialFormState);
    setSelectedBanquetId(null);
  };

  // Create request data with uploaded file URLs
  // Updated createRequestData function for your banquet dashboard
const createRequestData = async (form: BanquetFormState) => {
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
    
    // Basic banquet information
    formData.append('venueName', form.name);
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
    
    // Wedding and Banquet Information
    formData.append('offerWeddingPackages', form.offerWeddingPackages);
    formData.append('resortCategory', form.resortCategory);
    formData.append('weddingPackages', JSON.stringify(form.weddingPackages));
    formData.append('maxGuestCapacity', form.maxGuestCapacity);
    formData.append('totalRooms', form.totalRooms.toString());
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
    
    // Wedding Packages as JSON string
    formData.append('weddingPackages', JSON.stringify(form.weddingPackages));

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
    if (!newBanquetForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!newBanquetForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!newBanquetForm.category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!newBanquetForm.location.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!newBanquetForm.location.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!newBanquetForm.location.country.trim()) {
      toast.error("Country is required");
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Uploading files and creating banquet...");
      const data = await createRequestData(newBanquetForm);
      await dispatch(createBanquet(data)).unwrap();
      resetCreateForm();
      setIsCreateDialogOpen(false);
      toast.success("Banquet created successfully!");
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to create banquet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedBanquetId || isSubmitting) return;

    // Validation
    if (!editBanquetForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editBanquetForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!editBanquetForm.category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!editBanquetForm.location.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!editBanquetForm.location.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!editBanquetForm.location.country.trim()) {
      toast.error("Country is required");
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Uploading files and updating banquet...");
      const data = await createRequestData(editBanquetForm);
      await dispatch(updateBanquet({ id: selectedBanquetId, data })).unwrap();
      setIsEditDialogOpen(false);
      resetEditForm();
      toast.success("Banquet updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to update banquet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBanquetId || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await dispatch(deleteBanquet(selectedBanquetId)).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedBanquetId(null);
      toast.success("Banquet deleted successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete banquet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (banquetId: string, newStatus: BanquetFormState["status"]) => {
    try {
      setIsSubmitting(true);
      const banquet = banquets.find((h: Banquet) => h.id === banquetId);
      if (!banquet) return;
      
      const formData = new FormData();
      formData.append('status', newStatus);
      
      await dispatch(updateBanquet({ id: banquetId, data: formData })).unwrap();
      toast.success(`Banquet status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update banquet status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePremiumToggle = async (banquetId: string, isPremium: boolean) => {
    try {
      setIsSubmitting(true);
      const banquet = banquets.find((h: Banquet) => h.id === banquetId);
      if (!banquet) return;
      
      const formData = new FormData();
      formData.append('isPremium', isPremium.toString());
      
      await dispatch(updateBanquet({ id: banquetId, data: formData })).unwrap();
      toast.success(`Banquet premium status ${isPremium ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update premium status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeaturedToggle = async (banquetId: string, isFeatured: boolean) => {
    try {
      setIsSubmitting(true);
      const banquet = banquets.find((h: Banquet) => h.id === banquetId);
      if (!banquet) return;
      
      const formData = new FormData();
      formData.append('isFeatured', isFeatured.toString());
      
      await dispatch(updateBanquet({ id: banquetId, data: formData })).unwrap();
      toast.success(`Banquet featured status ${isFeatured ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update featured status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: BanquetFormState["status"]) => {
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
    formState: BanquetFormState,
    setFormState: React.Dispatch<React.SetStateAction<BanquetFormState>>
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
      
      setFormState((prev: BanquetFormState) => ({
        ...prev,
        imageFiles: files,
        images: newObjectUrls,
      }));
    } else {
      setFormState((prev: BanquetFormState) => ({
        ...prev,
        imageFiles: [],
        images: [],
      }));
    }
  };

  const removeImage = (
    index: number,
    formState: BanquetFormState,
    setFormState: React.Dispatch<React.SetStateAction<BanquetFormState>>
  ) => {
    const imageUrl = formState.images[index];
    
    // Revoke blob URL if it exists
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    
    setFormState((prev: BanquetFormState) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  // Render all form fields
  const renderFormFields = (
    form: BanquetFormState,
    setForm: React.Dispatch<React.SetStateAction<BanquetFormState>>
  ) => {
    return (
      <div className="space-y-4">
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

        {/* Banquet Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Banquet Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Banquet Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Banquet Hall Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Banquet Category"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Banquet Description"
              />
            </div>
            <div className="space-y-2">
              <Label>Venue Category</Label>
              <Input
                value={form.resortCategory}
                onChange={(e) => setForm((prev) => ({ ...prev, resortCategory: e.target.value }))}
                placeholder="Venue Category"
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
                    status: value as BanquetFormState["status"],
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
              <Label>Wedding Packages</Label>
              {form.weddingPackages && form.weddingPackages.length > 0 ? (
                <div className="space-y-3">
                  {form.weddingPackages.map((pkg, index) => (
                    <div key={index} className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-[#212D47]">{pkg.name || `Package ${index + 1}`}</span>
                        <span className="px-3 py-1 rounded-md bg-[#e7c1c2] text-[#212d47] text-sm md:text-base font-bold">
                          ₹ {Number(pkg.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>• {pkg.rooms || 0} Rooms Included</div>
                        <div>• Up to {pkg.totalGuests || 0} Guests</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 border rounded-md p-3">No packages added.</div>
              )}
              <p className="text-xs text-gray-500">Packages are managed when creating/updating via API or other tabs.</p>
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
              <Label>Total Number of Rooms</Label>
              <Input
                value={form.totalRooms}
                onChange={(e) => setForm((prev) => ({ ...prev, totalRooms: Number(e.target.value) }))}
                placeholder="Total Number of Rooms"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Images</h3>
            <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">   
                <Label>Banquet Profile Picture</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e, form, setForm)}
              />
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2 space-y-2">
                  {form.images.map((url, index) => (
                    <div key={index} className="relative group flex justify-center">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-full object-cover w-30 h-30 border border-gray-200"
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
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Banquets</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search banquets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Banquet</span>
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
                <TableHead className="min-w-[150px]">Price</TableHead>
                <TableHead className="min-w-[120px]">Rating</TableHead>
                <TableHead className="min-w-[90px]">Premium</TableHead>
                <TableHead className="min-w-[90px]">Featured</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedBanquets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No banquets found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedBanquets.map((banquet: Banquet) => (
                  <TableRow key={banquet.id} className="hover:bg-muted/50">
                    <TableCell className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border flex-shrink-0">
                        {banquet.images?.[0] ? (
                          <Image
                            src={banquet.images[0]}
                            alt={banquet.venueName}
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
                      <span className="font-medium truncate">{banquet.venueName}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{banquet.category}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {banquet.location?.city || 'N/A'}, {banquet.location?.country || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground"> ${banquet.priceRange?.startingPrice || 0}</TableCell>
                    <TableCell className="text-muted-foreground">{(banquet.rating || 0).toFixed(1)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={Boolean((banquet as any).isPremium)}
                          onCheckedChange={(checked) => handlePremiumToggle(banquet.id, checked)}
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Boolean((banquet as any).isPremium)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={Boolean((banquet as any).isFeatured)}
                          onCheckedChange={(checked) => handleFeaturedToggle(banquet.id, checked)}
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Boolean((banquet as any).isFeatured)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(banquet.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[banquet.status]}`}
                        >
                          {banquet.status.charAt(0).toUpperCase() + banquet.status.slice(1)}
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
                              const banquetForEdit: BanquetFormState = {
                                name: (banquet as any).name || banquet.venueName || "",
                                category: banquet.category || "",
                                location: banquet.location || initialFormState.location,
                                priceRange: banquet.priceRange || initialFormState.priceRange,
                                rating: banquet.rating || 0,
                                status: banquet.status as BanquetFormState["status"] || "draft",
                                description: banquet.description || "",
                                weddingPackages: (banquet as any).weddingPackages || [],
                                totalRooms: (banquet as any).totalRooms || 0,
                                amenities: Array.isArray(banquet.amenities) ? banquet.amenities.join(", ") : (banquet.amenities || ""),
                                servicesOffered: Array.isArray(banquet.servicesOffered) 
                                  ? banquet.servicesOffered.join(", ") 
                                  : (banquet.servicesOffered || ""),
                                diningOptions: Array.isArray(banquet.diningOptions) 
                                  ? banquet.diningOptions.join(", ") 
                                  : (banquet.diningOptions || ""),
                                otherAmenities: Array.isArray(banquet.otherAmenities) 
                                  ? banquet.otherAmenities.join(", ") 
                                  : (banquet.otherAmenities || ""),
                                  allInclusivePackages: typeof (banquet as any).allInclusivePackages === 'string' 
                                  ? (banquet as any).allInclusivePackages 
                                  : (Array.isArray((banquet as any).allInclusivePackages) 
                                    ? (banquet as any).allInclusivePackages[0] || "Yes"
                                    : "Yes"),
                                    
                                staffAccommodation: typeof (banquet as any).staffAccommodation === 'string'
                                  ? (banquet as any).staffAccommodation
                                  : (Array.isArray((banquet as any).staffAccommodation) 
                                    ? (banquet as any).staffAccommodation[0] || "Yes"
                                    : "Yes"),
                                    
                                preferredContactMethod: typeof (banquet as any).preferredContactMethod === 'string'
                                  ? (banquet as any).preferredContactMethod
                                  : (Array.isArray((banquet as any).preferredContactMethod) 
                                    ? (banquet as any).preferredContactMethod[0] || "Email"
                                    : "Email"),
                                images: banquet.images || [],
                                imageFiles: [],
                                contactInfo: banquet.contactInfo || initialFormState.contactInfo,
                                policies: banquet.policies || initialFormState.policies,
                                firstName: banquet.firstName || "",
                                lastName: banquet.lastName || "",
                                companyName: banquet.companyName || "",
                                venueType: banquet.venueType || "",
                                position: banquet.position || "",
                                websiteLink: banquet.websiteLink || "",
                                offerWeddingPackages: (banquet as any).offerWeddingPackages || "No",
                                resortCategory: banquet.resortCategory || "",
                                // servicesOffered: Array.isArray(banquet.servicesOffered) 
                                //   ? banquet.servicesOffered.join(", ") 
                                //   : banquet.servicesOffered || "",
                                maxGuestCapacity: banquet.maxGuestCapacity || "",
                                venueAvailability: banquet.venueAvailability || "",
                                // allInclusivePackages: banquet.allInclusivePackages?.toString() || "",
                                // staffAccommodation: banquet.staffAccommodation?.toString() || "",
                                 // diningOptions: Array.isArray(banquet.diningOptions) 
                                //   ? banquet.diningOptions.join(", ") 
                                //   : banquet.diningOptions || "",
                                // otherAmenities: Array.isArray(banquet.otherAmenities) 
                                //   ? banquet.otherAmenities.join(", ") 
                                //   : banquet.otherAmenities || "",
                                bookingLeadTime: banquet.bookingLeadTime || "",
                                // preferredContactMethod: Array.isArray(banquet.preferredContactMethod) 
                                //   ? banquet.preferredContactMethod.join(", ") 
                                //   : banquet.preferredContactMethod || "",
                                weddingDepositRequired: banquet.weddingDepositRequired || "",
                                refundPolicy: banquet.refundPolicy || "",
                                referralSource: banquet.referralSource || "",
                                partnershipInterest: banquet.partnershipInterest || "",
                                uploadResortPhotos: [],
                                uploadMarriagePhotos: [],
                                uploadWeddingBrochure: [],
                                uploadCancelledCheque: [],
                                agreeToTerms: banquet.agreeToTerms || false,
                                agreeToPrivacy: banquet.agreeToPrivacy || false,
                                signature: banquet.signature || "",
                                isPremium: Boolean((banquet as any).isPremium),
                                isFeatured: Boolean((banquet as any).isFeatured),
                                googleLocation: banquet.googleLocation || "", 
                              };
                              setEditBanquetForm(banquetForEdit);
                              setSelectedBanquetId(banquet.id);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {banquet.status !== 'active' && (
                            <DropdownMenuItem
                              onSelect={() => handleQuickStatusUpdate(banquet.id, 'active')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Active
                            </DropdownMenuItem>
                          )}
                          {banquet.status !== 'draft' && (
                            <DropdownMenuItem
                              onSelect={() => handleQuickStatusUpdate(banquet.id, 'draft')}
                              className="text-yellow-600"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Mark as Draft
                            </DropdownMenuItem>
                          )}
                          {banquet.status !== 'archived' && (
                            <DropdownMenuItem
                              onSelect={() => handleQuickStatusUpdate(banquet.id, 'archived')}
                              className="text-gray-600"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onSelect={() => {
                              setSelectedBanquetId(banquet.id);
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
            <DialogTitle>Add Banquet</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new banquet hall. Click create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderFormFields(newBanquetForm, setNewBanquetForm)}
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
              disabled={isSubmitting || !newBanquetForm.name.trim() || !newBanquetForm.description.trim()}
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
              <DialogTitle>Edit Banquet</DialogTitle>
              <DialogDescription>
                Update the details for this banquet hall. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {renderFormFields(editBanquetForm, setEditBanquetForm)}
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
                disabled={isSubmitting || !editBanquetForm.name.trim() || !editBanquetForm.description.trim()}
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
              This action cannot be undone. This will permanently delete the banquet hall and remove its data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedBanquetId(null);
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