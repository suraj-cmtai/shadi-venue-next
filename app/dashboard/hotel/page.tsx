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
  const auth = useSelector(selectAuth);
  const selectedHotel = useSelector(selectSelectedHotel);
  const isLoading = useSelector(selectHotelLoading);
  const error = useSelector(selectHotelError);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editHotelForm, setEditHotelForm] = useState<HotelFormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        status: selectedHotel.status,
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

  useEffect(() => {
    if (auth?.roleId) {
      dispatch(fetchHotelById(auth.roleId));
    }
  }, [dispatch, auth?.roleId]);

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
        status: selectedHotel.status,
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
    if (!editHotelForm || !auth?.roleId || isSubmitting) return;

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

      await dispatch(updateHotel({ id: auth.roleId, data: formData })).unwrap();
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] h-[60vh] overflow-y-scroll">
        <div className="max-h-[60vh] h-[60vh] overflow-y-scroll">
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
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {form.images.map((img, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border">
                <Image
                  src={img}
                  alt={`Hotel image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
    </div>
      </div>
  );

  return (
    <div className="container mx-auto py-8">
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : !selectedHotel ? (
        <div className="text-center">No hotel found</div>
      ) : (
        <div className="space-y-6">
          {/* Hotel Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{selectedHotel.name}</h1>
                <p className="text-gray-600">{selectedHotel.category}</p>
              </div>
              <Button onClick={() => setIsEditDialogOpen(true)}>
                Edit Hotel
              </Button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold">Location</h2>
                <p>{selectedHotel.location.address}</p>
                <p>{selectedHotel.location.city}, {selectedHotel.location.state}</p>
                <p>{selectedHotel.location.country}, {selectedHotel.location.zipCode}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold">Contact Information</h2>
                <p>Phone: {selectedHotel.contactInfo.phone}</p>
                <p>Email: {selectedHotel.contactInfo.email}</p>
                {selectedHotel.contactInfo.website && (
                  <p>Website: {selectedHotel.contactInfo.website}</p>
                )}
              </div>
              
              <div>
                <h2 className="text-lg font-semibold">Pricing</h2>
                <p>Starting from {selectedHotel.priceRange.currency} {selectedHotel.priceRange.startingPrice}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold">Status</h2>
                <span className={`px-2 py-1 rounded ${statusColors[selectedHotel.status]}`}>
                  {selectedHotel.status}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2">{selectedHotel.description}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedHotel.amenities.map((amenity, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1 rounded">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Images</h2>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedHotel.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${selectedHotel.name} - ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Hotel</DialogTitle>
            <DialogDescription>
              Make changes to your hotel information here.
            </DialogDescription>
          </DialogHeader>
          
          {editHotelForm && (
            <>
              {renderFormFields(editHotelForm, setEditHotelForm)}
              
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetEditForm();
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEdit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}