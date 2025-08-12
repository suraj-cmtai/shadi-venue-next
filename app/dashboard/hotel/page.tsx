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
  Dumbbell
} from "lucide-react";

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
  active: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
};

const getAmenityIcon = (amenity: string) => {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="h-4 w-4" />;
  if (lower.includes('parking') || lower.includes('garage')) return <Car className="h-4 w-4" />;
  if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell className="h-4 w-4" />;
  if (lower.includes('coffee') || lower.includes('breakfast')) return <Coffee className="h-4 w-4" />;
  return null;
};

export default function HotelDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const selectedHotel = useSelector(selectSelectedHotel);
  const isLoading = useSelector(selectHotelLoading);
  const error = useSelector(selectHotelError);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editHotelForm, setEditHotelForm] = useState<HotelFormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch hotel data when auth is available
  useEffect(() => {
    if (auth?.data?.role === 'hotel' && auth?.data?.roleId) {
      dispatch(fetchHotelById(auth.data.roleId));
    }
  }, [auth, dispatch]);

  // Initialize edit form when hotel data is loaded
  useEffect(() => {
    if (selectedHotel) {
      const formState: HotelFormState = {
        name: selectedHotel.name,
        category: selectedHotel.category,
        description: selectedHotel.description,
        location: { ...selectedHotel.location },
        priceRange: { ...selectedHotel.priceRange },
        rating: selectedHotel.rating,
        amenities: selectedHotel.amenities.join(', '),
        rooms: [...selectedHotel.rooms],
        images: [...selectedHotel.images],
        imageFiles: [],
        removeImages: false,
        contactInfo: {
          ...selectedHotel.contactInfo,
          website: selectedHotel.contactInfo.website || '',
        },
        policies: { ...selectedHotel.policies },
      };
      setEditHotelForm(formState);
    }
  }, [selectedHotel]);

  // Clean up object URLs when component unmounts or form changes
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

  const resetEditForm = () => {
    if (editHotelForm?.imageFiles && editHotelForm.imageFiles.length > 0) {
      editHotelForm.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    }
    if (selectedHotel) {
      const formState: HotelFormState = {
        name: selectedHotel.name,
        category: selectedHotel.category,
        description: selectedHotel.description,
        location: { ...selectedHotel.location },
        priceRange: { ...selectedHotel.priceRange },
        rating: selectedHotel.rating,
        amenities: selectedHotel.amenities.join(', '),
        rooms: [...selectedHotel.rooms],
        images: [...selectedHotel.images],
        imageFiles: [],
        removeImages: false,
        contactInfo: {
          ...selectedHotel.contactInfo,
          website: selectedHotel.contactInfo.website || '',
        },
        policies: { ...selectedHotel.policies },
      };
      setEditHotelForm(formState);
    } else {
      setEditHotelForm(null);
    }
  };

  const handleEdit = async () => {
    if (!editHotelForm || !auth?.data?.roleId || isSubmitting) return;

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
      formData.append(
        "amenities",
        editHotelForm.amenities
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .join(",")
      );
      formData.append("rooms", JSON.stringify(editHotelForm.rooms));
      formData.append("contactInfo", JSON.stringify(editHotelForm.contactInfo));
      formData.append("policies", JSON.stringify(editHotelForm.policies));

      editHotelForm.imageFiles.forEach((file: File) => {
        formData.append('images', file);
      });

      if (editHotelForm.removeImages) {
        formData.append("removeImages", "true");
      }

      await dispatch(updateHotel({ id: auth.data.roleId, data: formData })).unwrap();
      setIsEditDialogOpen(false);
      resetEditForm();
      toast.success("Hotel updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to update hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formState: HotelFormState,
    setFormState: React.Dispatch<React.SetStateAction<HotelFormState | null>>
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
    <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Hotel Name</Label>
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
              placeholder="Luxury Resort, Business Hotel, etc."
            />
          </div>
          <div>
            <Label htmlFor="rating">Rating (0-5)</Label>
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
              placeholder="4.5"
            />
          </div>
          <div>
            <Label htmlFor="startingPrice">Starting Price</Label>
            <div className="flex gap-2">
              <Select
                value={form.priceRange.currency}
                onValueChange={(value) =>
                  setForm((prev: HotelFormState | null) => (prev ? {
                    ...prev,
                    priceRange: { ...prev.priceRange, currency: value as HotelFormState["priceRange"]["currency"] },
                  } : null))
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["USD", "EUR", "CAD", "AUD", "GBP", "INR"].map((cur) => (
                    <SelectItem key={cur} value={cur}>
                      {cur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={form.priceRange.startingPrice}
                onChange={(e) =>
                  setForm((prev: HotelFormState | null) => (prev ? {
                    ...prev,
                    priceRange: { ...prev.priceRange, startingPrice: Number(e.target.value) },
                  } : null))
                }
                placeholder="100"
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((prev: HotelFormState | null) => (prev ? { ...prev, description: e.target.value } : null))}
            placeholder="Describe your hotel..."
            rows={4}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
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
              placeholder="123 Main Street"
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
              placeholder="New York"
            />
          </div>
          <div>
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={form.location.state}
              onChange={(e) =>
                setForm((prev: HotelFormState | null) => (prev ? {
                  ...prev,
                  location: { ...prev.location, state: e.target.value },
                } : null))
              }
              placeholder="NY"
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
              placeholder="United States"
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
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="+1 (555) 123-4567"
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
              placeholder="contact@hotel.com"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.contactInfo.website}
              onChange={(e) =>
                setForm((prev: HotelFormState | null) => (prev ? {
                  ...prev,
                  contactInfo: { ...prev.contactInfo, website: e.target.value },
                } : null))
              }
              placeholder="https://www.hotel.com"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
        <div>
          <Label htmlFor="amenities">Amenities (comma separated)</Label>
          <Input
            id="amenities"
            value={form.amenities}
            onChange={(e) => setForm((prev: HotelFormState | null) => (prev ? { ...prev, amenities: e.target.value } : null))}
            placeholder="WiFi, Pool, Spa, Parking, Gym, Restaurant"
          />
        </div>
      </div>

      {/* Policies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="checkIn">Check-In Time</Label>
            <Input
              id="checkIn"
              value={form.policies.checkIn}
              onChange={(e) =>
                setForm((prev: HotelFormState | null) => (prev ? {
                  ...prev,
                  policies: { ...prev.policies, checkIn: e.target.value },
                } : null))
              }
              placeholder="3:00 PM"
            />
          </div>
          <div>
            <Label htmlFor="checkOut">Check-Out Time</Label>
            <Input
              id="checkOut"
              value={form.policies.checkOut}
              onChange={(e) =>
                setForm((prev: HotelFormState | null) => (prev ? {
                  ...prev,
                  policies: { ...prev.policies, checkOut: e.target.value },
                } : null))
              }
              placeholder="11:00 AM"
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
              placeholder="Free cancellation up to 24 hours before check-in..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Images</h3>
        <div>
          <Label htmlFor="images">Upload New Images</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageChange(e, form, setForm)}
            className="cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-1">Maximum 5MB per image</p>
        </div>
        {form.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {form.images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                <Image
                  src={img}
                  alt={`Hotel image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your hotel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <Button 
            className="mt-4" 
            onClick={() => auth?.data?.roleId && dispatch(fetchHotelById(auth.data.roleId))}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedHotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg">No hotel found</div>
          <p className="text-gray-500 mt-2">Please check your account settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{selectedHotel.name}</h1>
                <Badge className={`${statusColors[selectedHotel.status]} font-medium`}>
                  {selectedHotel.status.charAt(0).toUpperCase() + selectedHotel.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{selectedHotel.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedHotel.location.city}, {selectedHotel.location.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>From {selectedHotel.priceRange.currency} {selectedHotel.priceRange.startingPrice}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsEditDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Hotel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery */}
            {selectedHotel.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedHotel.images.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`${selectedHotel.name} - ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About {selectedHotel.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{selectedHotel.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedHotel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getAmenityIcon(amenity) || <div className="h-4 w-4 bg-blue-500 rounded-full flex-shrink-0" />}
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rooms */}
            {selectedHotel.rooms && selectedHotel.rooms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Room Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedHotel.rooms.map((room, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bed className="h-5 w-5 text-gray-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">{room.type}</h4>
                            <p className="text-sm text-gray-600">
                              <Users className="h-4 w-4 inline mr-1" />
                              Up to {room.capacity} guests
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {selectedHotel.priceRange.currency} {room.pricePerNight}/night
                          </div>
                          <div className="text-sm text-gray-600">
                            {room.available} available
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-gray-600">{selectedHotel.contactInfo.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-gray-600">{selectedHotel.contactInfo.email}</div>
                  </div>
                </div>
                {selectedHotel.contactInfo.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Website</div>
                      <div className="text-gray-600 break-all">{selectedHotel.contactInfo.website}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="text-gray-700">
                    <div>{selectedHotel.location.address}</div>
                    <div>{selectedHotel.location.city}, {selectedHotel.location.state}</div>
                    <div>{selectedHotel.location.country} {selectedHotel.location.zipCode}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Hotel Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Check-In</div>
                    <div className="text-gray-600">{selectedHotel.policies.checkIn}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">Check-Out</div>
                    <div className="text-gray-600">{selectedHotel.policies.checkOut}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Cancellation Policy</div>
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {selectedHotel.policies.cancellation}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{selectedHotel.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{selectedHotel.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Room Types</span>
                  <span className="font-medium">{selectedHotel.rooms?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amenities</span>
                  <span className="font-medium">{selectedHotel.amenities.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Hotel Information</DialogTitle>
            <DialogDescription>
              Update your hotel details to keep your listing current and attractive to guests.
            </DialogDescription>
          </DialogHeader>
          
          {editHotelForm && (
            <>
              {renderFormFields(editHotelForm, setEditHotelForm)}
              
              <DialogFooter className="mt-6 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetEditForm();
                    setIsEditDialogOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEdit} 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}