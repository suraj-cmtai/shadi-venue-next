"use client";
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
  AlertCircle
} from "lucide-react";

import { Hotel } from "@/lib/redux/features/hotelSlice";

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
    amenities: (hotel.amenities || []).join(', '),
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
    firstName: hotel.firstName || '',
    lastName: hotel.lastName || '',
    companyName: hotel.companyName || '',
    venueType: hotel.venueType || '',
    position: hotel.position || '',
    websiteLink: hotel.websiteLink || '',
    offerWeddingPackages: hotel.offerWeddingPackages || 'No',
    resortCategory: hotel.resortCategory || '',
    weddingPackagePrice: hotel.weddingPackagePrice || '',
    servicesOffered: (hotel.servicesOffered || []).join(', '),
    maxGuestCapacity: hotel.maxGuestCapacity || '',
    numberOfRooms: hotel.numberOfRooms || '',
    venueAvailability: hotel.venueAvailability || '',
    allInclusivePackages: (hotel.allInclusivePackages || []).join(', '),
    staffAccommodation: (hotel.staffAccommodation || []).join(', '),
    diningOptions: (hotel.diningOptions || []).join(', '),
    otherAmenities: (hotel.otherAmenities || []).join(', '),
    bookingLeadTime: hotel.bookingLeadTime || '',
    preferredContactMethod: (hotel.preferredContactMethod || []).join(', '),
    weddingDepositRequired: hotel.weddingDepositRequired || '',
    refundPolicy: hotel.refundPolicy || '',
    referralSource: hotel.referralSource || '',
    partnershipInterest: hotel.partnershipInterest || '',
    uploadResortPhotos: [],
    uploadMarriagePhotos: [],
    uploadWeddingBrochure: [],
    uploadCancelledCheque: [],
  };
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
      await dispatch(updateHotel({ id: auth.data.roleId, data: formData })).unwrap();
      toast.success(`Hotel status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleImageUpload = async (files: File[], category: string) => {
    if (!files.length) return [];
    
    setUploadProgress(0);
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImageClient(files[i]);
        uploadedUrls.push(url);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        toast.error(`Failed to upload ${files[i].name}`);
      }
    }
    
    setUploadProgress(0);
    return uploadedUrls;
  };

  const handleEdit = async () => {
    if (!editHotelForm || !auth?.data?.roleId || isSubmitting) return;

    if (!editHotelForm.name.trim()) {
      toast.error("Hotel Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle file uploads first
      const uploadedImages = await handleImageUpload(editHotelForm.imageFiles, 'images');
      const uploadedResortPhotos = await handleImageUpload(editHotelForm.uploadResortPhotos, 'resort');
      const uploadedMarriagePhotos = await handleImageUpload(editHotelForm.uploadMarriagePhotos, 'marriage');
      
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(editHotelForm).forEach(([key, value]) => {
        if (key.includes('Files') || key.includes('upload')) return; // Skip file arrays
        
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        }
      });

      // Add uploaded file URLs
      if (uploadedImages.length) {
        formData.append('images', JSON.stringify([...editHotelForm.images, ...uploadedImages]));
      }
      if (uploadedResortPhotos.length) {
        formData.append('uploadResortPhotos', JSON.stringify(uploadedResortPhotos));
      }
      if (uploadedMarriagePhotos.length) {
        formData.append('uploadMarriagePhotos', JSON.stringify(uploadedMarriagePhotos));
      }

      await dispatch(updateHotel({ id: auth.data.roleId, data: formData })).unwrap();
      setIsEditDialogOpen(false);
      toast.success("Hotel updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update hotel.");
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <Select value={selectedHotel.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setIsEditDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                        {selectedHotel.priceRange.currency} {selectedHotel.priceRange.startingPrice}
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
                      <p>{selectedHotel.location.address}</p>
                      <p>{selectedHotel.location.city}, {selectedHotel.location.state}</p>
                      <p>{selectedHotel.location.country} {selectedHotel.location.zipCode}</p>
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
                        {selectedHotel.servicesOffered.map((service, index) => (
                          <Badge key={index} variant="secondary">{service}</Badge>
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
                          <p className="font-medium">{selectedHotel.priceRange.currency} {room.pricePerNight}</p>
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
                  {[...(selectedHotel.images || []), ...(selectedHotel.uploadResortPhotos || [])].map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image 
                          src={image} 
                          alt={`Gallery image ${index + 1}`} 
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
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Drag and drop images here, or click to browse</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'imageFiles')}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <Label htmlFor="gallery-upload" className="cursor-pointer">
                    <Button asChild>
                      <span>Choose Images</span>
                    </Button>
                  </Label>
                </div>
              </CardContent>
            </Card>
            
            {selectedHotel.uploadWeddingBrochure?.length || selectedHotel.uploadMarriagePhotos?.length || selectedHotel.uploadCancelledCheque?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedHotel.uploadWeddingBrochure?.length && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Wedding Brochure ({selectedHotel.uploadWeddingBrochure.length} files)</span>
                    </div>
                  )}
                  {selectedHotel.uploadMarriagePhotos?.length && (
                    <div className="flex items-center space-x-3">
                      <Camera className="h-5 w-5 text-green-600" />
                      <span>Marriage Photos ({selectedHotel.uploadMarriagePhotos.length} files)</span>
                    </div>
                  )}
                  {selectedHotel.uploadCancelledCheque?.length && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Cancelled Cheque ({selectedHotel.uploadCancelledCheque.length} files)</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hotel Information</DialogTitle>
            <DialogDescription>
              Update your venue details, contact information, and services.
            </DialogDescription>
          </DialogHeader>
          
          {editHotelForm && (
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="wedding">Wedding Services</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Hotel/Venue Name</Label>
                      <Input
                        value={editHotelForm.name}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={editHotelForm.companyName}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
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
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editHotelForm.description}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={editHotelForm.location.address}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, address: e.target.value } } : null)}
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={editHotelForm.location.city}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, city: e.target.value } } : null)}
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={editHotelForm.location.state}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, state: e.target.value } } : null)}
                      />
                    </div>
                    <div>
                      <Label>Zip Code</Label>
                      <Input
                        value={editHotelForm.location.zipCode}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, location: { ...prev.location, zipCode: e.target.value } } : null)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Amenities (comma-separated)</Label>
                    <Textarea
                      value={editHotelForm.amenities}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, amenities: e.target.value } : null)}
                      placeholder="WiFi, Parking, Pool, Gym, Restaurant..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={editHotelForm.firstName}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={editHotelForm.lastName}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={editHotelForm.position}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, position: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={editHotelForm.contactInfo.phone}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, contactInfo: { ...prev.contactInfo, phone: e.target.value } } : null)}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editHotelForm.contactInfo.email}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, contactInfo: { ...prev.contactInfo, email: e.target.value } } : null)}
                      />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input
                        value={editHotelForm.websiteLink}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, websiteLink: e.target.value } : null)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="wedding" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Offer Wedding Packages?</Label>
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
                      <Label>Wedding Package Price</Label>
                      <Input
                        value={editHotelForm.weddingPackagePrice}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, weddingPackagePrice: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label>Max Guest Capacity</Label>
                      <Input
                        value={editHotelForm.maxGuestCapacity}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, maxGuestCapacity: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label>Number of Rooms</Label>
                      <Input
                        value={editHotelForm.numberOfRooms}
                        onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, numberOfRooms: e.target.value } : null)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Services Offered (comma-separated)</Label>
                    <Textarea
                      value={editHotelForm.servicesOffered}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, servicesOffered: e.target.value } : null)}
                      placeholder="Catering, Decoration, Photography, Music..."
                    />
                  </div>

                  <div>
                    <Label>Dining Options (comma-separated)</Label>
                    <Textarea
                      value={editHotelForm.diningOptions}
                      onChange={(e) => setEditHotelForm(prev => prev ? { ...prev, diningOptions: e.target.value } : null)}
                      placeholder="Restaurant, Bar, Room Service, Banquet..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Venue Images</Label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'imageFiles')}
                      />
                    </div>
                    <div>
                      <Label>Resort Photos</Label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'uploadResortPhotos')}
                      />
                    </div>
                    <div>
                      <Label>Marriage Photos</Label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'uploadMarriagePhotos')}
                      />
                    </div>
                    <div>
                      <Label>Wedding Brochure</Label>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'uploadWeddingBrochure')}
                      />
                    </div>
                    <div>
                      <Label>Cancelled Cheque</Label>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => handleFileChange(e, 'uploadCancelledCheque')}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}