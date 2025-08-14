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
  Dumbbell,
  Building,
  Briefcase,
  Heart,
  Calendar,
  Package,
  FileText,
  Camera,
  User,
  Info
} from "lucide-react";

// Updated Hotel Interface with optional new fields
export interface Hotel {
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

  // New optional form fields
  firstName?: string;
  lastName?: string;
  companyName?: string;
  venueType?: string;
  position?: string;
  websiteLink?: string;
  offerWeddingPackages?: 'Yes' | 'No';
  resortCategory?: string;
  weddingPackagePrice?: string;
  servicesOffered?: string[];
  maxGuestCapacity?: string;
  numberOfRooms?: string;
  venueAvailability?: string;
  allInclusivePackages?: ('Yes' | 'No' | 'Partially')[];
  staffAccommodation?: ('Yes' | 'No' | 'Limited')[];
  diningOptions?: string[];
  otherAmenities?: string[];
  bookingLeadTime?: string;
  preferredContactMethod?: string[];
  weddingDepositRequired?: string;
  refundPolicy?: string;
  referralSource?: string;
  partnershipInterest?: string;
  uploadResortPhotos?: string[];
  uploadMarriagePhotos?: string[];
  uploadWeddingBrochure?: string[];
  uploadCancelledCheque?: string[];
  agreeToTerms?: boolean;
  agreeToPrivacy?: boolean;
  signature?: string;
}

// Form state to handle form inputs, ensuring no undefined values
interface HotelFormState {
  name: string;
  category: string;
  location: { address: string; city: string; state: string; country: string; zipCode: string; };
  priceRange: { startingPrice: number; currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR'; };
  rating: number;
  description: string;
  amenities: string;
  rooms: { type: string; capacity: number; pricePerNight: number; available: number; }[];
  images: string[];
  imageFiles: File[];
  removeImages: boolean;
  contactInfo: { phone: string; email: string; website: string; };
  policies: { checkIn: string; checkOut: string; cancellation: string; };
  
  // New fields mirrored for the form
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
        // Existing fields
        name: hotel.name || '',
        category: hotel.category || '',
        location: hotel.location || { address: '', city: '', state: '', country: '', zipCode: '' },
        priceRange: hotel.priceRange || { startingPrice: 0, currency: 'USD' },
        rating: hotel.rating || 0,
        description: hotel.description || '',
        amenities: (hotel.amenities || []).join(', '),
        rooms: hotel.rooms || [],
        images: hotel.images || [],
        imageFiles: [],
        removeImages: false,
        contactInfo: { phone: hotel.contactInfo?.phone || '', email: hotel.contactInfo?.email || '', website: hotel.contactInfo?.website || '' },
        policies: hotel.policies || { checkIn: '', checkOut: '', cancellation: '' },

        // New optional fields with fallbacks
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

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editHotelForm, setEditHotelForm] = useState<HotelFormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth?.data?.role === 'hotel' && auth?.data?.roleId) {
      dispatch(fetchHotelById(auth.data.roleId));
    }
  }, [auth, dispatch]);

  useEffect(() => {
    setEditHotelForm(getInitialFormState(selectedHotel));
  }, [selectedHotel]);

  const handleEdit = async () => {
    if (!editHotelForm || !auth?.data?.roleId || isSubmitting) return;

    if (!editHotelForm.name.trim()) {
      toast.error("Hotel Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(editHotelForm).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (key.endsWith('Files') || Array.isArray(value) && value.every(item => item instanceof File)) {
          // Handled separately
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        }
      });

      // Handle file arrays
      editHotelForm.imageFiles.forEach(file => formData.append('images', file));
      editHotelForm.uploadResortPhotos.forEach(file => formData.append('uploadResortPhotos', file));
      editHotelForm.uploadMarriagePhotos.forEach(file => formData.append('uploadMarriagePhotos', file));
      editHotelForm.uploadWeddingBrochure.forEach(file => formData.append('uploadWeddingBrochure', file));
      editHotelForm.uploadCancelledCheque.forEach(file => formData.append('uploadCancelledCheque', file));

      await dispatch(updateHotel({ id: auth.data.roleId, data: formData })).unwrap();
      setIsEditDialogOpen(false);
      toast.success("Hotel updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update hotel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof HotelFormState) => {
    const files = Array.from(e.target.files || []);
    setEditHotelForm(prev => prev ? { ...prev, [fieldName]: files } : null);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editHotelForm) return;
    const files = Array.from(e.target.files || []);
    editHotelForm.images.forEach(img => { if (img.startsWith("blob:")) URL.revokeObjectURL(img) });
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setEditHotelForm(prev => prev ? { ...prev, imageFiles: files, images: objectUrls, removeImages: false } : null);
  };

  const renderFormFields = (
    form: HotelFormState,
    setForm: React.Dispatch<React.SetStateAction<HotelFormState | null>>
  ) => (
    <div className="max-h-[70vh] overflow-y-auto space-y-6 p-1">
        <Card>
            <CardHeader><CardTitle>Primary Contact & Company</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Company Name" value={form.companyName} onChange={(e) => setForm(prev => prev ? { ...prev, companyName: e.target.value } : null)} />
                <Input placeholder="First Name" value={form.firstName} onChange={(e) => setForm(prev => prev ? { ...prev, firstName: e.target.value } : null)} />
                <Input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm(prev => prev ? { ...prev, lastName: e.target.value } : null)} />
                <Input placeholder="Position" value={form.position} onChange={(e) => setForm(prev => prev ? { ...prev, position: e.target.value } : null)} />
                <Input placeholder="Website Link" value={form.websiteLink} onChange={(e) => setForm(prev => prev ? { ...prev, websiteLink: e.target.value } : null)} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Wedding & Venue Details</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label>Offer Wedding Packages?</Label>
                    <Select value={form.offerWeddingPackages} onValueChange={(val: "Yes" | "No") => setForm(prev => prev ? { ...prev, offerWeddingPackages: val } : null)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                </div>
                <Input placeholder="Wedding Package Price" value={form.weddingPackagePrice} onChange={(e) => setForm(prev => prev ? { ...prev, weddingPackagePrice: e.target.value } : null)} />
                <Input placeholder="Max Guest Capacity" value={form.maxGuestCapacity} onChange={(e) => setForm(prev => prev ? { ...prev, maxGuestCapacity: e.target.value } : null)} />
                <Input placeholder="Number of Rooms" value={form.numberOfRooms} onChange={(e) => setForm(prev => prev ? { ...prev, numberOfRooms: e.target.value } : null)} />
                <Textarea className="md:col-span-2" placeholder="Services Offered (comma-separated)" value={form.servicesOffered} onChange={(e) => setForm(prev => prev ? { ...prev, servicesOffered: e.target.value } : null)} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>General Hotel Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Input placeholder="Hotel Name" value={form.name} onChange={(e) => setForm(prev => prev ? { ...prev, name: e.target.value } : null)} />
                <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm(prev => prev ? { ...prev, description: e.target.value } : null)} />
                <Textarea placeholder="Amenities (comma-separated)" value={form.amenities} onChange={(e) => setForm(prev => prev ? { ...prev, amenities: e.target.value } : null)} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>File Uploads</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div><Label>Venue Images</Label><Input type="file" multiple accept="image/*" onChange={handleImageChange} /></div>
                <div><Label>Resort Photos</Label><Input type="file" multiple onChange={(e) => handleFileChange(e, 'uploadResortPhotos')} /></div>
                <div><Label>Marriage Photos</Label><Input type="file" multiple onChange={(e) => handleFileChange(e, 'uploadMarriagePhotos')} /></div>
                <div><Label>Wedding Brochure</Label><Input type="file" multiple onChange={(e) => handleFileChange(e, 'uploadWeddingBrochure')} /></div>
                <div><Label>Cancelled Cheque</Label><Input type="file" multiple onChange={(e) => handleFileChange(e, 'uploadCancelledCheque')} /></div>
            </CardContent>
        </Card>
    </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!selectedHotel) return <div className="min-h-screen flex items-center justify-center text-gray-600">No hotel data found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedHotel.companyName || selectedHotel.name}</h1>
            <Badge className={`${statusColors[selectedHotel.status]} mt-1`}>{selectedHotel.status}</Badge>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700"><Edit3 className="h-4 w-4 mr-2" />Edit Details</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Gallery</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...(selectedHotel.images || []), ...(selectedHotel.uploadResortPhotos || [])].map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image src={image} alt={`Gallery image ${index + 1}`} layout="fill" className="object-cover" />
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedHotel.offerWeddingPackages && (
            <Card>
                <CardHeader><CardTitle>Wedding & Venue Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <p><Heart className="h-5 w-5 inline mr-2 text-pink-500"/><strong>Offers Packages:</strong> {selectedHotel.offerWeddingPackages}</p>
                       {selectedHotel.weddingPackagePrice && <p><Package className="h-5 w-5 inline mr-2"/><strong>Package Price:</strong> {selectedHotel.weddingPackagePrice}</p>}
                       {selectedHotel.maxGuestCapacity && <p><Users className="h-5 w-5 inline mr-2"/><strong>Max Guests:</strong> {selectedHotel.maxGuestCapacity}</p>}
                       {selectedHotel.numberOfRooms && <p><Bed className="h-5 w-5 inline mr-2"/><strong>Rooms:</strong> {selectedHotel.numberOfRooms}</p>}
                       {selectedHotel.bookingLeadTime && <p><Calendar className="h-5 w-5 inline mr-2"/><strong>Lead Time:</strong> {selectedHotel.bookingLeadTime}</p>}
                       {selectedHotel.weddingDepositRequired && <p><CreditCard className="h-5 w-5 inline mr-2"/><strong>Deposit:</strong> {selectedHotel.weddingDepositRequired}</p>}
                    </div>
                    {selectedHotel.servicesOffered && selectedHotel.servicesOffered.length > 0 && <div><strong>Services Offered:</strong><div className="flex flex-wrap gap-2 mt-2">{selectedHotel.servicesOffered.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div></div>}
                </CardContent>
            </Card>
          )}

          <Card><CardHeader><CardTitle>About {selectedHotel.name}</CardTitle></CardHeader><CardContent><p>{selectedHotel.description}</p></CardContent></Card>
        </div>

        <div className="space-y-6">
          {(selectedHotel.firstName || selectedHotel.position) && (
            <Card>
              <CardHeader><CardTitle>Primary Contact</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                  {selectedHotel.firstName && <div className="flex items-center gap-3"><User className="h-5 w-5"/>{selectedHotel.firstName} {selectedHotel.lastName}</div>}
                  {selectedHotel.position && <div className="flex items-center gap-3"><Briefcase className="h-5 w-5"/>{selectedHotel.position}</div>}
                  <div className="flex items-center gap-3"><Mail className="h-5 w-5"/>{selectedHotel.contactInfo.email}</div>
                  <div className="flex items-center gap-3"><Phone className="h-5 w-5"/>{selectedHotel.contactInfo.phone}</div>
                  {selectedHotel.websiteLink && <div className="flex items-center gap-3"><Globe className="h-5 w-5"/>{selectedHotel.websiteLink}</div>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent className="flex items-start gap-3"><MapPin className="h-5 w-5 mt-1"/><div><div>{selectedHotel.location.address}</div><div>{selectedHotel.location.city}, {selectedHotel.location.state}</div><div>{selectedHotel.location.country} {selectedHotel.location.zipCode}</div></div></CardContent>
          </Card>
          
          {(selectedHotel.uploadWeddingBrochure?.length || selectedHotel.uploadMarriagePhotos?.length || selectedHotel.uploadCancelledCheque?.length) && (
            <Card>
              <CardHeader><CardTitle>Uploaded Documents</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                  {selectedHotel.uploadWeddingBrochure?.length && <p><FileText className="h-4 w-4 inline mr-2"/> Wedding Brochure ({selectedHotel.uploadWeddingBrochure.length})</p>}
                  {selectedHotel.uploadMarriagePhotos?.length && <p><Camera className="h-4 w-4 inline mr-2"/> Marriage Photos ({selectedHotel.uploadMarriagePhotos.length})</p>}
                  {selectedHotel.uploadCancelledCheque?.length && <p><FileText className="h-4 w-4 inline mr-2"/> Cancelled Cheque ({selectedHotel.uploadCancelledCheque.length})</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Edit Hotel Information</DialogTitle><DialogDescription>Update the details for your venue.</DialogDescription></DialogHeader>
          {editHotelForm && (
            <>
              {renderFormFields(editHotelForm, setEditHotelForm)}
              <DialogFooter className="mt-6 gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleEdit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}