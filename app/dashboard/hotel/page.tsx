"use client";
// dashboard/hotel/page.tsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchHotelById,
  updateHotel,
  selectSelectedHotel,
  selectHotelLoading,
  selectHotelError,
} from "@/lib/redux/features/hotelSlice";
import { selectAuth } from "@/lib/redux/features/authSlice";
import { toast } from "sonner";
import { uploadImageClient, uploadPDFClient } from "@/lib/firebase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  DollarSign,
  Users,
  Bed,
  Clock,
  CreditCard,
  Edit3,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Building,
  Briefcase,
  Heart,
  Calendar,
  Package,
  FileText,
  Camera,
  User,
  Info,
  Save,
  Upload,
  Trash2,
  Plus,
  Settings,
  Eye,
  BarChart3,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

import { Hotel } from "@/lib/redux/features/hotelSlice";
import Link from "next/link";

// Helper function to safely convert array or string to comma-separated string
const arrayToString = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return '';
};

// Helper function to safely convert comma-separated string to array
const stringToArray = (value: string): string[] => {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

// Form state interface
interface HotelFormState {
  name: string;
  category: string;
  location: { address: string; city: string; state: string; country: string; zipCode: string; };
  priceRange: { startingPrice: number; currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR'; };
  rating: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
  amenities: string;
  rooms: { type: string; capacity: number; pricePerNight: number; available: number; }[];
  images: string[];
  imageFiles: File[];
  removeImages: boolean;
  contactInfo: { phone: string; email: string; website: string; };
  policies: { checkIn: string; checkOut: string; cancellation: string; };
  googleLocation: string;

  // New fields
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
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  signature: string;

  // File uploads
  uploadResortPhotos: File[];
  uploadMarriagePhotos: File[];
  uploadWeddingBrochure: File[];
  uploadCancelledCheque: File[];
}

interface RoomFormState {
  type: string;
  capacity: number;
  pricePerNight: number;
  available: number;
}

const statusColors: Record<Hotel["status"], string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
};

const getAmenityIcon = (amenity: string) => {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi')) return <Wifi className="h-4 w-4" />;
  if (lower.includes('parking')) return <Car className="h-4 w-4" />;
  if (lower.includes('gym')) return <Dumbbell className="h-4 w-4" />;
  if (lower.includes('breakfast')) return <Coffee className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
};

// Helper to safely initialize form state from potentially incomplete hotel data
const getInitialFormState = (hotel: Hotel | null): HotelFormState | null => {
  if (!hotel) return null;

  return {
    name: hotel.name || '',
    category: hotel.category || '',
    location: hotel.location || { address: '', city: '', state: '', country: '', zipCode: '' },
    priceRange: hotel.priceRange || { startingPrice: 0, currency: 'USD' },
    rating: hotel.rating || 0,
    status: hotel.status || 'draft',
    description: hotel.description || '',
    amenities: arrayToString(hotel.amenities),
    rooms: hotel.rooms || [],
    images: hotel.images || [],
    imageFiles: [],
    removeImages: false,
    contactInfo: {
      phone: hotel.contactInfo?.phone || '',
      email: hotel.contactInfo?.email || '',
      website: hotel.contactInfo?.website || ''
    },
    policies: hotel.policies || { checkIn: '', checkOut: '', cancellation: '' },
    googleLocation: hotel.googleLocation || '',

    // Personal information
    firstName: hotel.firstName || '',
    lastName: hotel.lastName || '',
    companyName: hotel.companyName || '',
    venueType: hotel.venueType || '',
    position: hotel.position || '',
    websiteLink: hotel.websiteLink || '',

    // Wedding services - FIX THESE PROBLEMATIC FIELDS
    offerWeddingPackages: hotel.offerWeddingPackages || 'No',
    resortCategory: hotel.resortCategory || '',
    weddingPackagePrice: hotel.weddingPackagePrice || '',
    servicesOffered: arrayToString(hotel.servicesOffered),
    maxGuestCapacity: hotel.maxGuestCapacity || '',
    numberOfRooms: hotel.numberOfRooms || '',
    venueAvailability: hotel.venueAvailability || '',

    // Fix these boolean/array field conversions:
    allInclusivePackages: typeof hotel.allInclusivePackages === 'string'
      ? hotel.allInclusivePackages
      : (Array.isArray(hotel.allInclusivePackages) ? hotel.allInclusivePackages[0] : ''),
    staffAccommodation: typeof hotel.staffAccommodation === 'string'
      ? hotel.staffAccommodation
      : (Array.isArray(hotel.staffAccommodation) ? hotel.staffAccommodation[0] : ''),
    preferredContactMethod: typeof hotel.preferredContactMethod === 'string'
      ? hotel.preferredContactMethod
      : (Array.isArray(hotel.preferredContactMethod) ? hotel.preferredContactMethod[0] : ''),
    diningOptions: arrayToString(hotel.diningOptions),
    otherAmenities: arrayToString(hotel.otherAmenities),

    // Business information
    bookingLeadTime: hotel.bookingLeadTime || '',
    weddingDepositRequired: hotel.weddingDepositRequired || '',
    refundPolicy: hotel.refundPolicy || '',
    referralSource: hotel.referralSource || '',
    partnershipInterest: hotel.partnershipInterest || '',

    // Agreement fields
    agreeToTerms: hotel.agreeToTerms || false,
    agreeToPrivacy: hotel.agreeToPrivacy || false,
    signature: hotel.signature || '',

    // File uploads (initialize as empty arrays for new uploads)
    uploadResortPhotos: [],
    uploadMarriagePhotos: [],
    uploadWeddingBrochure: [],
    uploadCancelledCheque: [],
  };
};

// File upload helper functions
const uploadFile = async (file: File): Promise<string> => {
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
};

const uploadFiles = async (files: File[]): Promise<string[]> => {
  if (!files.length) return [];

  try {
    const uploadPromises = files.map(file => uploadFile(file));
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    throw new Error(`Failed to upload files: ${error.message}`);
  }
};

export default function HotelDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const selectedHotel = useSelector(selectSelectedHotel);
  const isLoading = useSelector(selectHotelLoading);
  const error = useSelector(selectHotelError);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editHotelForm, setEditHotelForm] = useState<HotelFormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Room management state
  const [roomForm, setRoomForm] = useState<RoomFormState>({ type: '', capacity: 1, pricePerNight: 0, available: 0 });
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

  useEffect(() => {
    if (auth?.data?.role === 'hotel' && auth?.data?.roleId) {
      dispatch(fetchHotelById(auth.data.roleId));
    }
  }, [auth, dispatch]);

  useEffect(() => {
    setEditHotelForm(getInitialFormState(selectedHotel));
  }, [selectedHotel]);

  const handleStatusChange = async (newStatus: 'active' | 'draft' | 'archived') => {
    if (!auth?.data?.roleId || !selectedHotel) return;

    const formData = new FormData();
    formData.append('status', newStatus);

    try {
      setIsSubmitting(true);
      await dispatch(updateHotel({ id: auth.data.roleId, data: formData })).unwrap();
      toast.success(`Hotel status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editHotelForm || !auth?.data?.roleId || isSubmitting) return;

    if (!editHotelForm.name.trim()) {
      toast.error("Hotel Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle file uploads first with progress tracking
      setUploadProgress(10);
      const uploadedImages = await uploadFiles(editHotelForm.imageFiles);
      setUploadProgress(30);
      const uploadedResortPhotos = await uploadFiles(editHotelForm.uploadResortPhotos);
      setUploadProgress(50);
      const uploadedMarriagePhotos = await uploadFiles(editHotelForm.uploadMarriagePhotos);
      setUploadProgress(70);
      const uploadedWeddingBrochures = await uploadFiles(editHotelForm.uploadWeddingBrochure);
      setUploadProgress(90);
      const uploadedCancelledCheques = await uploadFiles(editHotelForm.uploadCancelledCheque);

      const formData = new FormData();

      // Basic hotel information
      formData.append('name', editHotelForm.name);
      formData.append('category', editHotelForm.category);
      formData.append('description', editHotelForm.description);
      formData.append('rating', editHotelForm.rating.toString());
      formData.append('status', editHotelForm.status);

      // Location - use nested field names
      formData.append('location[address]', editHotelForm.location.address);
      formData.append('location[city]', editHotelForm.location.city);
      formData.append('location[state]', editHotelForm.location.state);
      formData.append('location[country]', editHotelForm.location.country);
      formData.append('location[zipCode]', editHotelForm.location.zipCode);

      // Price Range
      formData.append('priceRange[startingPrice]', editHotelForm.priceRange.startingPrice.toString());
      formData.append('priceRange[currency]', editHotelForm.priceRange.currency);

      // Contact Info
      formData.append('contactInfo[phone]', editHotelForm.contactInfo.phone);
      formData.append('contactInfo[email]', editHotelForm.contactInfo.email);
      formData.append('contactInfo[website]', editHotelForm.contactInfo.website);

      // Policies
      formData.append('policies[checkIn]', editHotelForm.policies.checkIn);
      formData.append('policies[checkOut]', editHotelForm.policies.checkOut);
      formData.append('policies[cancellation]', editHotelForm.policies.cancellation);

      // Personal information
      formData.append('firstName', editHotelForm.firstName);
      formData.append('lastName', editHotelForm.lastName);
      formData.append('companyName', editHotelForm.companyName);
      formData.append('venueType', editHotelForm.venueType);
      formData.append('position', editHotelForm.position);
      formData.append('websiteLink', editHotelForm.websiteLink);

      // Wedding and venue information
      formData.append('offerWeddingPackages', editHotelForm.offerWeddingPackages);
      formData.append('resortCategory', editHotelForm.resortCategory);
      formData.append('weddingPackagePrice', editHotelForm.weddingPackagePrice);
      formData.append('maxGuestCapacity', editHotelForm.maxGuestCapacity);
      formData.append('numberOfRooms', editHotelForm.numberOfRooms);
      formData.append('venueAvailability', editHotelForm.venueAvailability);
      formData.append('bookingLeadTime', editHotelForm.bookingLeadTime);
      formData.append('weddingDepositRequired', editHotelForm.weddingDepositRequired);
      formData.append('refundPolicy', editHotelForm.refundPolicy);
      formData.append('referralSource', editHotelForm.referralSource);
      formData.append('partnershipInterest', editHotelForm.partnershipInterest);

      // Agreement fields
      formData.append('agreeToTerms', editHotelForm.agreeToTerms.toString());
      formData.append('agreeToPrivacy', editHotelForm.agreeToPrivacy.toString());
      formData.append('signature', editHotelForm.signature);
      formData.append('googleLocation', editHotelForm.googleLocation);

      // Convert comma-separated strings to individual fields for API (amenities as array)
      stringToArray(editHotelForm.amenities).forEach((amenity) => {
        formData.append('amenities', amenity);
      });
      formData.append('servicesOffered', JSON.stringify(stringToArray(editHotelForm.servicesOffered)));
      formData.append('diningOptions', JSON.stringify(stringToArray(editHotelForm.diningOptions)));
      formData.append('otherAmenities', JSON.stringify(stringToArray(editHotelForm.otherAmenities)));
      formData.append('allInclusivePackages', editHotelForm.allInclusivePackages);
      formData.append('staffAccommodation', editHotelForm.staffAccommodation);
      formData.append('preferredContactMethod', editHotelForm.preferredContactMethod);

      // Rooms
      formData.append('rooms', JSON.stringify(editHotelForm.rooms));

      // Handle images - combine existing (not removed) with new uploads
      const finalImages = [
        ...(editHotelForm.images || []),
        ...uploadedImages
      ];
      finalImages.forEach((url, index) => {
        formData.append(`images[${index}]`, url);
      });

      // Handle resort photos
      const finalResortPhotos = [
        ...((editHotelForm as any).existing_uploadResortPhotos || selectedHotel?.uploadResortPhotos || []),
        ...uploadedResortPhotos
      ];
      finalResortPhotos.forEach((url, index) => {
        formData.append(`uploadResortPhotos[${index}]`, url);
      });

      // Handle marriage photos
      const finalMarriagePhotos = [
        ...((editHotelForm as any).existing_uploadMarriagePhotos || selectedHotel?.uploadMarriagePhotos || []),
        ...uploadedMarriagePhotos
      ];
      finalMarriagePhotos.forEach((url, index) => {
        formData.append(`uploadMarriagePhotos[${index}]`, url);
      });

      // Handle documents
      uploadedWeddingBrochures.forEach((url, index) => {
        formData.append(`uploadWeddingBrochure[${index}]`, url);
      });
      uploadedCancelledCheques.forEach((url, index) => {
        formData.append(`uploadCancelledCheque[${index}]`, url);
      });

      setUploadProgress(100);
      await dispatch(updateHotel({ id: auth.data.roleId, data: formData })).unwrap();
      setIsEditDialogOpen(false);
      toast.success("Hotel updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update hotel.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleRoomAdd = () => {
    if (!editHotelForm || !roomForm.type.trim()) return;

    const newRoom = { ...roomForm };
    if (editingRoomIndex !== null) {
      const updatedRooms = [...editHotelForm.rooms];
      updatedRooms[editingRoomIndex] = newRoom;
      setEditHotelForm(prev => prev ? { ...prev, rooms: updatedRooms } : null);
      setEditingRoomIndex(null);
    } else {
      setEditHotelForm(prev => prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : null);
    }

    setRoomForm({ type: '', capacity: 1, pricePerNight: 0, available: 0 });
  };

  const handleRoomEdit = (index: number) => {
    if (!editHotelForm) return;
    setRoomForm(editHotelForm.rooms[index]);
    setEditingRoomIndex(index);
  };

  const handleRoomDelete = (index: number) => {
    if (!editHotelForm) return;
    const updatedRooms = editHotelForm.rooms.filter((_, i) => i !== index);
    setEditHotelForm(prev => prev ? { ...prev, rooms: updatedRooms } : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof HotelFormState) => {
    const files = Array.from(e.target.files || []);
    setEditHotelForm(prev => prev ? { ...prev, [fieldName]: files } : null);
  };

  const handleImageRemove = (index: number) => {
    if (!editHotelForm) return;
    const updatedImages = editHotelForm.images.filter((_, i) => i !== index);
    setEditHotelForm(prev => prev ? { ...prev, images: updatedImages } : null);
  };

  // Add these new handler functions to your component:

  const handleNewImageRemove = (fieldName: keyof HotelFormState, index: number) => {
    if (!editHotelForm) return;
    const currentFiles = editHotelForm[fieldName] as File[];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    setEditHotelForm(prev => prev ? { ...prev, [fieldName]: updatedFiles } : null);
  };

  const handleExistingFileRemove = (fieldName: string, index: number) => {
    if (!selectedHotel || !editHotelForm) return;

    // Create a copy of the existing files and remove the one at index
    const currentFiles = (selectedHotel as any)[fieldName] || [];
    const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);

    // Update the form state to track removed files
    setEditHotelForm(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [`existing_${fieldName}`]: updatedFiles
      } as any;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading hotel data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  if (!selectedHotel) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="text-center">
          <Building className="h-12 w-12 mx-auto mb-4" />
          <p>No hotel data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedHotel.companyName || selectedHotel.name}
                </h1>
                <p className="text-sm text-gray-600">Hotel Management Dashboard</p>
              </div>
              <Badge className={`${statusColors[selectedHotel.status]}`}>
                {selectedHotel.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              {/* <Select 
                value={selectedHotel.status} 
                onValueChange={handleStatusChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select> */}

              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Bed className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                      <p className="text-2xl font-bold">{selectedHotel.rooms?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <p className="text-2xl font-bold">{selectedHotel.rating}/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Starting Price</p>
                      <p className="text-2xl font-bold">
                        {selectedHotel.priceRange?.currency} {selectedHotel.priceRange?.startingPrice}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Max Capacity</p>
                      <p className="text-2xl font-bold">{selectedHotel.maxGuestCapacity || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => setActiveTab("details")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Hotel Information
                  </Button>
                  <Button className="w-full justify-start" onClick={() => setActiveTab("rooms")}>
                    <Bed className="h-4 w-4 mr-2" />
                    Manage Rooms
                  </Button>
                  <Button className="w-full justify-start" onClick={() => setActiveTab("gallery")}>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                  <Button className="w-full justify-start" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit All Details
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Hotel profile updated</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(selectedHotel.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedHotel.firstName && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <span>{selectedHotel.firstName} {selectedHotel.lastName}</span>
                    </div>
                  )}
                  {selectedHotel.position && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-500" />
                      <span>{selectedHotel.position}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>{selectedHotel.contactInfo?.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span>{selectedHotel.contactInfo?.phone || 'Not provided'}</span>
                  </div>
                  {selectedHotel.websiteLink && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <span>{selectedHotel.websiteLink}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p>{selectedHotel.location?.address}</p>
                      <p>{selectedHotel.location?.city}, {selectedHotel.location?.state}</p>
                      <p>{selectedHotel.location?.country} {selectedHotel.location?.zipCode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedHotel.offerWeddingPackages === 'Yes' && (
              <Card>
                <CardHeader>
                  <CardTitle>Wedding & Event Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Wedding Packages</Label>
                      <p className="text-lg">{selectedHotel.offerWeddingPackages}</p>
                    </div>
                    {selectedHotel.weddingPackagePrice && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Package Price</Label>
                        <p className="text-lg">{selectedHotel.weddingPackagePrice}</p>
                      </div>
                    )}
                  </div>

                  {selectedHotel.servicesOffered && selectedHotel.servicesOffered.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">Services Offered</Label>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedHotel.servicesOffered) ? selectedHotel.servicesOffered : [selectedHotel.servicesOffered]).map((service, index) => (
                          <Badge key={index} variant="secondary">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedHotel.diningOptions && selectedHotel.diningOptions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">Dining Options</Label>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedHotel.diningOptions) ? selectedHotel.diningOptions : [selectedHotel.diningOptions]).map((option, index) => (
                          <Badge key={index} variant="secondary">{option}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">Amenities</Label>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedHotel.amenities) ? selectedHotel.amenities : [selectedHotel.amenities]).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Input
                    placeholder="Room Type"
                    value={roomForm.type}
                    onChange={(e) => setRoomForm(prev => ({ ...prev, type: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Capacity"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="Price per Night"
                    value={roomForm.pricePerNight}
                    onChange={(e) => setRoomForm(prev => ({ ...prev, pricePerNight: Number(e.target.value) }))}
                  />
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Available"
                      value={roomForm.available}
                      onChange={(e) => setRoomForm(prev => ({ ...prev, available: Number(e.target.value) }))}
                    />
                    <Button onClick={handleRoomAdd}>
                      {editingRoomIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedHotel.rooms?.map((room, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Type</Label>
                          <p className="font-medium">{room.type}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Capacity</Label>
                          <p className="font-medium">{room.capacity} guests</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Price per Night</Label>
                          <p className="font-medium">{selectedHotel.priceRange?.currency} {room.pricePerNight}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Available</Label>
                          <p className="font-medium">{room.available} rooms</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => handleRoomEdit(index)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRoomDelete(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!selectedHotel.rooms || selectedHotel.rooms.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Bed className="h-12 w-12 mx-auto mb-4" />
                      <p>No rooms configured yet. Add your first room above.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Uploading images...</span>
                      <span className="text-sm">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Main hotel images */}
                  {(selectedHotel.images || []).map((image, index) => (
                    <div key={`main-${index}`} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={`Hotel image ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleImageRemove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Resort photos */}
                  {(selectedHotel.uploadResortPhotos || []).map((image, index) => (
                    <div key={`resort-${index}`} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={`Resort photo ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Badge className="absolute bottom-2 left-2 bg-blue-500">Resort</Badge>
                    </div>
                  ))}

                  {/* Marriage photos */}
                  {(selectedHotel.uploadMarriagePhotos || []).map((image, index) => (
                    <div key={`marriage-${index}`} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={`Marriage photo ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Badge className="absolute bottom-2 left-2 bg-pink-500">Wedding</Badge>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Upload more images to showcase your venue</p>
                  <Button onClick={() => setIsEditDialogOpen(true)}>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              </CardContent>
            </Card>

            {(selectedHotel.uploadWeddingBrochure?.length || selectedHotel.uploadCancelledCheque?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedHotel.uploadWeddingBrochure?.length && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>Wedding Brochure ({selectedHotel.uploadWeddingBrochure.length} files)</span>
                      </div>
                      <div className="flex gap-2">
                        {selectedHotel.uploadWeddingBrochure.map((brochure, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(brochure, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedHotel.uploadCancelledCheque?.length && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span>Banking Documents ({selectedHotel.uploadCancelledCheque.length} files)</span>
                      </div>
                      <div className="flex gap-2">
                        {selectedHotel.uploadCancelledCheque.map((doc, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>



          {/* Analytics Tab */}
          {/* <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Profile Views</p>
                      <p className="text-2xl font-bold">---</p>
                      <p className="text-xs text-gray-500">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Inquiries</p>
                      <p className="text-2xl font-bold">---</p>
                      <p className="text-xs text-gray-500">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Favorites</p>
                      <p className="text-2xl font-bold">---</p>
                      <p className="text-xs text-gray-500">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                  <p>Detailed analytics and insights will be available in a future update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hotel Information</DialogTitle>
            <DialogDescription>
              Update your venue details, contact information, and services.
            </DialogDescription>
          </DialogHeader>

          {uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Uploading files...</span>
                <span className="text-sm">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {editHotelForm && (
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="wedding">Wedding Services</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Hotel/Venue Name *</Label>
                      <Input
                        id="name"
                        value={editHotelForm.name}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={editHotelForm.companyName}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={editHotelForm.category} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, category: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="resort">Resort</SelectItem>
                          <SelectItem value="boutique">Boutique</SelectItem>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="heritage">Heritage</SelectItem>
                          <SelectItem value="eco">Eco-Friendly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="venueType">Venue Type</Label>
                      <Select value={editHotelForm.venueType} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, venueType: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hotel Resort">Hotel Resort</SelectItem>
                          <SelectItem value="Beach Resort">Beach Resort</SelectItem>
                          <SelectItem value="Mountain Resort">Mountain Resort</SelectItem>
                          <SelectItem value="City Hotel">City Hotel</SelectItem>
                          <SelectItem value="Heritage Property">Heritage Property</SelectItem>
                          <SelectItem value="Boutique Hotel">Boutique Hotel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Starting Price</Label>
                      <div className="flex space-x-2">
                        <Select value={editHotelForm.priceRange.currency} onValueChange={(val: any) => setEditHotelForm(prev => prev ? { ...prev, priceRange: { ...prev.priceRange, currency: val } } : null)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={editHotelForm.priceRange.startingPrice}
                          onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, priceRange: { ...prev.priceRange, startingPrice: Number(e.target.value) } } : null)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating (1-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={editHotelForm.rating}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, rating: Number(e.target.value) } : null)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editHotelForm.description}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={4}
                    />
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">Address Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country/Region *</Label>
                      <Select value={editHotelForm.location.country} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, country: val } } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={editHotelForm.location.address}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, address: e.target.value } } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={editHotelForm.location.city}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, city: e.target.value } } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={editHotelForm.location.state}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, state: e.target.value } } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        value={editHotelForm.location.zipCode}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, zipCode: e.target.value } } : null)}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={editHotelForm.firstName}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editHotelForm.lastName}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position *</Label>
                      <Input
                        id="position"
                        value={editHotelForm.position}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, position: e.target.value } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={editHotelForm.contactInfo.phone}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, contactInfo: { ...prev.contactInfo, phone: e.target.value } } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editHotelForm.contactInfo.email}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, contactInfo: { ...prev.contactInfo, email: e.target.value } } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website Link</Label>
                      <Input
                        id="website"
                        value={editHotelForm.websiteLink}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, websiteLink: e.target.value } : null)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="googleLocation">Google Maps Location</Label>
                      <Textarea
                        id="googleLocation"
                        value={editHotelForm.googleLocation}
                        onChange={(e) => {
                          const input = e.target.value;
                          // Extract URL from iframe using regex
                          const regex = /src="([^"]*google\.com\/maps\/embed[^"]*)"/;
                          const match = input.match(regex);
                          const extractedUrl = match ? match[1] : input;
                          setEditHotelForm(prev => prev ? { ...prev, googleLocation: extractedUrl } : null);
                        }}
                        placeholder="Paste Google Maps embed code or URL here"
                        rows={2}
                      />
                      <p className="text-xs text-gray-500 mt-1">You can paste the full iframe embed code or just the URL</p>
                    </div>
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">Preferred Contact Method *</h3>
                  <div className="space-y-2">
                    {['Email', 'Phone', 'Direct Message (Website)'].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={method}
                          name="preferredContactMethod"
                          checked={editHotelForm.preferredContactMethod === method}
                          onChange={() => setEditHotelForm(prev => prev ? {
                            ...prev,
                            preferredContactMethod: method
                          } : null)}
                        />
                        <Label htmlFor={method}>{method}</Label>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkIn">Check-In Time</Label>
                      <Input
                        id="checkIn"
                        value={editHotelForm.policies.checkIn}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, policies: { ...prev.policies, checkIn: e.target.value } } : null)}
                        placeholder="e.g., 14:00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOut">Check-Out Time</Label>
                      <Input
                        id="checkOut"
                        value={editHotelForm.policies.checkOut}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, policies: { ...prev.policies, checkOut: e.target.value } } : null)}
                        placeholder="e.g., 11:00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cancellation">Cancellation Policy</Label>
                    <Textarea
                      id="cancellation"
                      value={editHotelForm.policies.cancellation}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, policies: { ...prev.policies, cancellation: e.target.value } } : null)}
                      placeholder="Describe your cancellation policy..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="wedding" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Do You Offer Wedding Packages? *</Label>
                      <Select value={editHotelForm.offerWeddingPackages} onValueChange={(val: "Yes" | "No") => setEditHotelForm(prev => prev ? { ...prev, offerWeddingPackages: val } : null)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="resortCategory">Your Resort/Hotel Category *</Label>
                      <Select value={editHotelForm.resortCategory} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, resortCategory: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Deluxe">Deluxe</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Budget">Budget</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weddingPackagePrice">Wedding Package Price Range (2 Nights)</Label>
                      <Input
                        id="weddingPackagePrice"
                        value={editHotelForm.weddingPackagePrice}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, weddingPackagePrice: e.target.value } : null)}
                        placeholder="e.g., $5000 - $15000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGuestCapacity">Maximum Guest Capacity in Numbers</Label>
                      <Input
                        id="maxGuestCapacity"
                        type="number"
                        value={editHotelForm.maxGuestCapacity}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, maxGuestCapacity: e.target.value } : null)}
                        placeholder="e.g., 200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="numberOfRooms">Number of Rooms Available for Guests</Label>
                      <Input
                        id="numberOfRooms"
                        type="number"
                        value={editHotelForm.numberOfRooms}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, numberOfRooms: e.target.value } : null)}
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venueAvailability">Wedding Venue Availability</Label>
                      <Select value={editHotelForm.venueAvailability} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, venueAvailability: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Year Round">Year Round</SelectItem>
                          <SelectItem value="Seasonal">Seasonal</SelectItem>
                          <SelectItem value="Peak Season Only">Peak Season Only</SelectItem>
                          <SelectItem value="Off Season Only">Off Season Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bookingLeadTime">Booking Lead Time</Label>
                      <Select value={editHotelForm.bookingLeadTime} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, bookingLeadTime: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3 Months">1-3 Months</SelectItem>
                          <SelectItem value="3-6 Months">3-6 Months</SelectItem>
                          <SelectItem value="6-12 Months">6-12 Months</SelectItem>
                          <SelectItem value="1+ Year">1+ Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weddingDepositRequired">Wedding Deposit Required?</Label>
                      <Select value={editHotelForm.weddingDepositRequired} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, weddingDepositRequired: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deposit requirement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10%">10%</SelectItem>
                          <SelectItem value="20%">20%</SelectItem>
                          <SelectItem value="30%">30%</SelectItem>
                          <SelectItem value="50%">50%</SelectItem>
                          <SelectItem value="Full Payment">Full Payment</SelectItem>
                          <SelectItem value="No Deposit">No Deposit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">Services Offered *</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      'Ceremony Venue',
                      'Reception Venue',
                      'Catering',
                      'Bridal Suite',
                      'Wedding Planner/Coordinator',
                      'Floral Arrangements',
                      'Photography',
                      'Entertainment',
                      'Officiant',
                      'Transportation'
                    ].map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={stringToArray(editHotelForm.servicesOffered).includes(service)}
                          onCheckedChange={(checked) => {
                            const currentServices = stringToArray(editHotelForm.servicesOffered);
                            const newServices = checked
                              ? [...currentServices, service]
                              : currentServices.filter(s => s !== service);
                            setEditHotelForm(prev => prev ? {
                              ...prev,
                              servicesOffered: newServices.join(', ')
                            } : null);
                          }}
                        />
                        <Label htmlFor={service}>{service}</Label>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">Do you offer all-inclusive wedding packages? *</h3>
                  <div className="space-y-2">
                    {['Yes', 'No', 'Partially'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`inclusive-${option}`}
                          name="allInclusivePackages"
                          checked={editHotelForm.allInclusivePackages === option}
                          onChange={() => setEditHotelForm(prev => prev ? {
                            ...prev,
                            allInclusivePackages: option
                          } : null)}
                        />
                        <Label htmlFor={`inclusive-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">On-Site Accommodation of Drivers & Help *</h3>
                  <div className="space-y-2">
                    {['Yes', 'No', 'Limited'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`staff-${option}`}
                          name="staffAccommodation"
                          checked={editHotelForm.staffAccommodation === option}
                          onChange={() => setEditHotelForm(prev => prev ? {
                            ...prev,
                            staffAccommodation: option
                          } : null)}
                        />
                        <Label htmlFor={`staff-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">Available Dining Options *</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      'Buffet',
                      'Plated Meals',
                      'Custom Menus',
                      'Vegetarian',
                      'Non Vegetarian'
                    ].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dining-${option}`}
                          checked={stringToArray(editHotelForm.diningOptions).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentOptions = stringToArray(editHotelForm.diningOptions);
                            const newOptions = checked
                              ? [...currentOptions, option]
                              : currentOptions.filter(o => o !== option);
                            setEditHotelForm(prev => prev ? {
                              ...prev,
                              diningOptions: newOptions.join(', ')
                            } : null);
                          }}
                        />
                        <Label htmlFor={`dining-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="refundPolicy">Refund/Cancellation Policy</Label>
                    <Textarea
                      id="refundPolicy"
                      value={editHotelForm.refundPolicy}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, refundPolicy: e.target.value } : null)}
                      placeholder="Describe your refund and cancellation policy..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="referralSource">How did you hear about our shadi venue website? *</Label>
                      <Select value={editHotelForm.referralSource} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, referralSource: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Google Search">Google Search</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Word of Mouth">Word of Mouth</SelectItem>
                          <SelectItem value="Advertisement">Advertisement</SelectItem>
                          <SelectItem value="Business Partner">Business Partner</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="partnershipInterest">Partnership/Promotional Interest *</Label>
                      <Select value={editHotelForm.partnershipInterest} onValueChange={(val) => setEditHotelForm(prev => prev ? { ...prev, partnershipInterest: val } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interest level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Very Interested">Very Interested</SelectItem>
                          <SelectItem value="Interested">Interested</SelectItem>
                          <SelectItem value="Maybe">Maybe</SelectItem>
                          <SelectItem value="Not Interested">Not Interested</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="space-y-4">
                  <div>
                    <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                    <Textarea
                      id="amenities"
                      value={editHotelForm.amenities}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, amenities: e.target.value } : null)}
                      placeholder="WiFi, Parking, Pool, Gym, Restaurant, Bar, Spa..."
                      rows={3}
                    />
                  </div>

                  <Separator />
                  <h3 className="text-lg font-semibold">Other Amenities *</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      'Spa',
                      'Pool',
                      'Fitness Center',
                      'Golf Course',
                      'Business Center',
                      'Conference Rooms',
                      'Airport Shuttle',
                      'Concierge Service',
                      'Room Service',
                      'Laundry Service',
                      'Other'
                    ].map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={stringToArray(editHotelForm.otherAmenities).includes(amenity)}
                          onCheckedChange={(checked) => {
                            const currentAmenities = stringToArray(editHotelForm.otherAmenities);
                            const newAmenities = checked
                              ? [...currentAmenities, amenity]
                              : currentAmenities.filter(a => a !== amenity);
                            setEditHotelForm(prev => prev ? {
                              ...prev,
                              otherAmenities: newAmenities.join(', ')
                            } : null);
                          }}
                        />
                        <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>


                <TabsContent value="files" className="space-y-4">
                  <div className="space-y-6">
                    {/* Hotel Images Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Hotel Images</Label>
                        <div>
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'imageFiles')}
                            className="hidden"
                            id="hotel-images-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('hotel-images-input')?.click()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Images
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing hotel images */}
                        {editHotelForm?.images?.map((image, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-blue-200">
                              <Image
                                src={image}
                                alt={`Hotel image ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => handleImageRemove(index)}
                            >
                              ✕
                            </Button>
                            <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">Existing</Badge>
                          </div>
                        ))}

                        {/* New hotel images to be uploaded */}
                        {editHotelForm?.imageFiles?.map((file, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`New hotel image ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => handleNewImageRemove('imageFiles', index)}
                            >
                              ✕
                            </Button>
                            <Badge className="absolute bottom-1 left-1 text-xs bg-green-500">New</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Resort Photos Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Resort Photos *</Label>
                        <div>
                          <Input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => handleFileChange(e, 'uploadResortPhotos')}
                            className="hidden"
                            id="resort-photos-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('resort-photos-input')?.click()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Photos
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing resort photos */}
                        {(selectedHotel?.uploadResortPhotos || []).map((image, index) => (
                          <div key={`existing-resort-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-blue-200">
                              <Image
                                src={image}
                                alt={`Resort photo ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => handleExistingFileRemove('uploadResortPhotos', index)}
                            >
                              ✕
                            </Button>
                            <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">Existing</Badge>
                          </div>
                        ))}

                        {/* New resort photos */}
                        {editHotelForm?.uploadResortPhotos?.map((file, index) => (
                          <div key={`new-resort-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`New resort photo ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => handleNewImageRemove('uploadResortPhotos', index)}
                            >
                              ✕
                            </Button>
                            <Badge className="absolute bottom-1 left-1 text-xs bg-green-500">New</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Marriage Photos Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Marriage Photos</Label>
                        <div>
                          <Input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => handleFileChange(e, 'uploadMarriagePhotos')}
                            className="hidden"
                            id="marriage-photos-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('marriage-photos-input')?.click()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Photos
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing marriage photos */}
                        {(selectedHotel?.uploadMarriagePhotos || []).map((image, index) => (
                          <div key={`existing-marriage-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-blue-200">
                              <Image
                                src={image}
                                alt={`Marriage photo ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => handleExistingFileRemove('uploadMarriagePhotos', index)}
                            >
                              ✕
                            </Button>
                            <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">Existing</Badge>
                          </div>
                        ))}

                        {/* New marriage photos */}
                        {editHotelForm?.uploadMarriagePhotos?.map((file, index) => (
                          <div key={`new-marriage-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`New marriage photo ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => handleNewImageRemove('uploadMarriagePhotos', index)}
                            >
                              ✕
                            </Button>
                            <Badge className="absolute bottom-1 left-1 text-xs bg-green-500">New</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Document Upload Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="weddingBrochure">Wedding Package Brochure</Label>
                        <Input
                          id="weddingBrochure"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, 'uploadWeddingBrochure')}
                        />
                        <p className="text-sm text-gray-500 mt-1">Upload your wedding package brochure (PDF, DOC, DOCX)</p>
                      </div>

                      <div>
                        <Label htmlFor="cancelledCheque">Cancel Cheque Copy of Your Resort Account</Label>
                        <Input
                          id="cancelledCheque"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'uploadCancelledCheque')}
                        />
                        <p className="text-sm text-gray-500 mt-1">Upload a cancelled cheque for verification (PDF, JPG, PNG)</p>
                      </div>
                    </div>

                    {/* Terms & Agreements */}
                    <Separator />
                    <h3 className="text-lg font-semibold">Terms & Agreements</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeTerms"
                          checked={editHotelForm?.agreeToTerms || false}
                          onCheckedChange={(checked) => setEditHotelForm(prev => prev ? { ...prev, agreeToTerms: !!checked } : null)}
                          required
                        />
                        <Label htmlFor="agreeTerms">I agree to the <Link href="/terms-and-conditions">terms and conditions *</Link></Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreePrivacy"
                          checked={editHotelForm?.agreeToPrivacy || false}
                          onCheckedChange={(checked) => setEditHotelForm(prev => prev ? { ...prev, agreeToPrivacy: !!checked } : null)}
                          required
                        />
                        <Label htmlFor="agreePrivacy">I agree to the <Link href="/privacy-policy">Privacy Policy *</Link></Label>
                      </div>

                      <div>
                        <Label htmlFor="signature">Digital Signature</Label>
                        <Input
                          id="signature"
                          value={editHotelForm?.signature || ''}
                          onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, signature: e.target.value } : null)}
                          placeholder="Type your full name as signature"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>


              </Tabs>
            </div>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isSubmitting || !editHotelForm?.name?.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}