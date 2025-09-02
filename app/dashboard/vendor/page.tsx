"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchVendorById,
  updateVendor,
  selectSelectedVendor,
  selectVendorLoading,
  selectVendorError,
} from "@/lib/redux/features/vendorSlice";
import { selectAuth } from "@/lib/redux/features/authSlice";
import { toast } from "sonner";
import { uploadImageClient, replaceImageClient } from "@/lib/firebase-client";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  Users,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Camera,
  Edit,
  Upload,
  Save,
  Eye,
  Building,
  DollarSign,
  MapIcon,
  Settings,
  Image as ImageIcon,
} from "lucide-react";

// Types
type VendorCategory =
  | "Venue"
  | "Planner"
  | "Photographer"
  | "Decorator"
  | "Caterer"
  | "Makeup"
  | "Entertainment"
  | "Others";
type ServiceArea = "Local City" | "Statewide" | "Pan India" | "International";
type PaymentMode = "UPI" | "Cash" | "Bank Transfer" | "Card" | "Other";
type Facility = "Rooms" | "Parking" | "Catering" | "Decor" | "DJ" | "Liquor License" | "Pool" | "Other";

interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  yearOfEstablishment?: string;
  contactPersonName: string;
  designation: "Owner" | "Manager" | "Other";
  mobileNumber: string;
  mobileVerified?: boolean;
  whatsappNumber?: string;
  email: string;
  websiteOrSocial?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  serviceAreas: ServiceArea[];
  servicesOffered: string[];
  startingPrice: number;
  guestCapacityMin?: number;
  guestCapacityMax?: number;
  facilitiesAvailable?: Facility[];
  specialities?: string;
  logoUrl: string;
  coverImageUrl: string;
  portfolioImages: string[];
  videoLinks?: string[];
  about: string;
  awards?: string;
  notableClients?: string;
  advancePaymentPercent?: number;
  refundPolicy?: string;
  paymentModesAccepted: PaymentMode[];
  username: string;
  agreedToTerms: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface VendorFormState extends Omit<Vendor, 'servicesOffered' | 'videoLinks' | 'serviceAreas' | 'paymentModesAccepted' | 'facilitiesAvailable'> {
  servicesOffered: string;
  videoLinks: string;
  serviceAreas: ServiceArea[];
  paymentModesAccepted: PaymentMode[];
  facilitiesAvailable: Facility[];
  logoFile?: File;
  coverImageFile?: File;
  portfolioFiles?: File[];
  removeImages?: string[];
}

const categories: VendorCategory[] = [
  "Venue", "Planner", "Photographer", "Decorator", "Caterer", "Makeup", "Entertainment", "Others"
];
const serviceAreas: ServiceArea[] = ["Local City", "Statewide", "Pan India", "International"];
const paymentModes: PaymentMode[] = ["UPI", "Cash", "Bank Transfer", "Card", "Other"];
const facilities: Facility[] = ["Rooms", "Parking", "Catering", "Decor", "DJ", "Liquor License", "Pool", "Other"];
const designations = ["Owner", "Manager", "Other"];

// Helper functions
const arrayToString = (value: any): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
};

const stringToArray = (value: string): string[] => {
  if (!value || typeof value !== "string") return [];
  return value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
};

const getInitialFormState = (vendor: Vendor | null): VendorFormState | null => {
  if (!vendor) return null;
  return {
    ...vendor,
    servicesOffered: arrayToString(vendor.servicesOffered),
    videoLinks: arrayToString(vendor.videoLinks),
    serviceAreas: vendor.serviceAreas || [],
    paymentModesAccepted: vendor.paymentModesAccepted || [],
    facilitiesAvailable: vendor.facilitiesAvailable || [],
    logoFile: undefined,
    coverImageFile: undefined,
    portfolioFiles: [],
    removeImages: [],
  };
};

export default function VendorDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const vendor = useSelector(selectSelectedVendor);
  const isLoading = useSelector(selectVendorLoading);
  const errorFromRedux = useSelector(selectVendorError);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<VendorFormState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File handling
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof VendorFormState) => {
    if (!formData) return;
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (field === 'portfolioFiles') {
      setFormData({ ...formData, [field]: files });
    } else {
      setFormData({ ...formData, [field]: files[0] });
    }
  };

  // Input handling
  const handleInputChange = (field: keyof VendorFormState, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  // Array field handling (checkboxes)
  const handleArrayFieldChange = (field: keyof VendorFormState, value: string, checked: boolean) => {
    if (!formData) return;
    const currentArray = formData[field] as any[];
    if (checked) {
      setFormData({ ...formData, [field]: [...currentArray, value] });
    } else {
      setFormData({ ...formData, [field]: currentArray.filter(item => item !== value) });
    }
  };

  // Remove portfolio image
  const handleRemovePortfolioImage = (index: number) => {
    if (!formData) return;
    const newImages = [...formData.portfolioImages];
    const removedImage = newImages.splice(index, 1)[0];
    setFormData({
      ...formData,
      portfolioImages: newImages,
      removeImages: [...(formData.removeImages || []), removedImage]
    });
  };

  // Submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !vendor) return;
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();

      // Basic fields
      fd.append("name", formData.name);
      fd.append("category", formData.category);
      if (formData.yearOfEstablishment) fd.append("yearOfEstablishment", formData.yearOfEstablishment);
      fd.append("contactPersonName", formData.contactPersonName);
      fd.append("designation", formData.designation);
      fd.append("mobileNumber", formData.mobileNumber);
      fd.append("mobileVerified", String(formData.mobileVerified ?? false));
      if (formData.whatsappNumber) fd.append("whatsappNumber", formData.whatsappNumber);
      fd.append("email", formData.email);
      if (formData.websiteOrSocial) fd.append("websiteOrSocial", formData.websiteOrSocial);
      fd.append("address", formData.address);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("pinCode", formData.pinCode);

      // Array fields
      formData.serviceAreas.forEach((area) => fd.append("serviceAreas", area));
      stringToArray(formData.servicesOffered).forEach((service) => fd.append("servicesOffered", service));
      formData.paymentModesAccepted.forEach((mode) => fd.append("paymentModesAccepted", mode));
      formData.facilitiesAvailable.forEach((facility) => fd.append("facilitiesAvailable", facility));

      // Numeric fields
      fd.append("startingPrice", String(formData.startingPrice));
      if (formData.guestCapacityMin !== undefined) fd.append("guestCapacityMin", String(formData.guestCapacityMin));
      if (formData.guestCapacityMax !== undefined) fd.append("guestCapacityMax", String(formData.guestCapacityMax));
      if (formData.advancePaymentPercent !== undefined) fd.append("advancePaymentPercent", String(formData.advancePaymentPercent));

      // Text fields
      fd.append("about", formData.about);
      if (formData.specialities) fd.append("specialities", formData.specialities);
      if (formData.awards) fd.append("awards", formData.awards);
      if (formData.notableClients) fd.append("notableClients", formData.notableClients);
      if (formData.refundPolicy) fd.append("refundPolicy", formData.refundPolicy);

      // Video links
      if (formData.videoLinks) {
        stringToArray(formData.videoLinks).forEach((link) => fd.append("videoLinks", link));
      }

      // System fields
      fd.append("username", formData.username);
      fd.append("agreedToTerms", String(formData.agreedToTerms));
      fd.append("status", formData.status);

      // Current URLs (for non-file fields)
      if (!formData.logoFile) fd.append("logoUrl", formData.logoUrl);
      if (!formData.coverImageFile) fd.append("coverImageUrl", formData.coverImageUrl);

      // Portfolio images (existing ones not being removed)
      formData.portfolioImages
        .filter(img => !formData.removeImages?.includes(img))
        .forEach((img) => fd.append("portfolioImages", img));

      // File uploads
      if (formData.logoFile) fd.append("logoFile", formData.logoFile);
      if (formData.coverImageFile) fd.append("coverImageFile", formData.coverImageFile);
      if (formData.portfolioFiles && formData.portfolioFiles.length > 0) {
        formData.portfolioFiles.forEach((file) => fd.append("portfolioFiles", file));
      }

      // Images to remove
      if (formData.removeImages && formData.removeImages.length > 0) {
        formData.removeImages.forEach((img) => fd.append("removeImages", img));
      }

      await dispatch(updateVendor({ id: vendor.id, data: fd }) as any).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (auth?.data?.role === "vendor" && auth?.data?.roleId) {
      dispatch(fetchVendorById(auth.data.roleId));
    }
  }, [auth, dispatch]);

  useEffect(() => {
    setFormData(getInitialFormState(vendor));
  }, [vendor]);

  useEffect(() => {
    if (errorFromRedux) setError(errorFromRedux);
  }, [errorFromRedux]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Vendor not found'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // If editing, show a full form with all fields in tabs (using shadcn/ui Tabs)
  if (isEditing && formData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-10">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Vendor Profile</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={uploading}
                  className="ml-4"
                >
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <Tabs defaultValue="business" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="business">
                      <Building size={16} className="mr-2" />
                      Business Info
                    </TabsTrigger>
                    <TabsTrigger value="services">
                      <Settings size={16} className="mr-2" />
                      Services
                    </TabsTrigger>
                    <TabsTrigger value="portfolio">
                      <ImageIcon size={16} className="mr-2" />
                      Portfolio
                    </TabsTrigger>
                  </TabsList>

                  {/* Business Info Tab */}
                  <TabsContent value="business">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Business Name *</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="yearOfEstablishment">Year of Establishment</Label>
                          <Input
                            id="yearOfEstablishment"
                            type="number"
                            value={formData.yearOfEstablishment || ''}
                            onChange={(e) => handleInputChange('yearOfEstablishment', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username *</Label>
                          <Input
                            id="username"
                            value={formData.username || ''}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                          <Input
                            id="contactPersonName"
                            value={formData.contactPersonName || ''}
                            onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="designation">Designation *</Label>
                          <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {designations.map((des) => (
                                <SelectItem key={des} value={des}>{des}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="mobileNumber">Mobile Number *</Label>
                          <Input
                            id="mobileNumber"
                            value={formData.mobileNumber || ''}
                            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                          <Input
                            id="whatsappNumber"
                            value={formData.whatsappNumber || ''}
                            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="websiteOrSocial">Website/Social Media</Label>
                          <Input
                            id="websiteOrSocial"
                            value={formData.websiteOrSocial || ''}
                            onChange={(e) => handleInputChange('websiteOrSocial', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city || ''}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={formData.state || ''}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pinCode">Pin Code *</Label>
                          <Input
                            id="pinCode"
                            value={formData.pinCode || ''}
                            onChange={(e) => handleInputChange('pinCode', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Service Areas *</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {serviceAreas.map((area) => (
                            <div key={area} className="flex items-center space-x-2">
                              <Checkbox
                                id={`serviceArea-${area}`}
                                checked={formData.serviceAreas?.includes(area) || false}
                                onCheckedChange={(checked) =>
                                  handleArrayFieldChange('serviceAreas', area, checked as boolean)
                                }
                              />
                              <Label htmlFor={`serviceArea-${area}`} className="text-sm">{area}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Services Tab */}
                  <TabsContent value="services">
                    <div className="space-y-8">
                      <div>
                        <Label htmlFor="servicesOffered">Services Offered (comma-separated) *</Label>
                        <Textarea
                          id="servicesOffered"
                          value={formData.servicesOffered || ''}
                          onChange={(e) => handleInputChange('servicesOffered', e.target.value)}
                          placeholder="e.g., Wedding Photography, Pre-wedding Shoots, Event Coverage"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="startingPrice">Starting Price (₹) *</Label>
                          <Input
                            id="startingPrice"
                            type="number"
                            value={formData.startingPrice || ''}
                            onChange={(e) => handleInputChange('startingPrice', parseInt(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="guestCapacityMin">Min Guest Capacity</Label>
                          <Input
                            id="guestCapacityMin"
                            type="number"
                            value={formData.guestCapacityMin || ''}
                            onChange={(e) => handleInputChange('guestCapacityMin', parseInt(e.target.value) || undefined)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="guestCapacityMax">Max Guest Capacity</Label>
                          <Input
                            id="guestCapacityMax"
                            type="number"
                            value={formData.guestCapacityMax || ''}
                            onChange={(e) => handleInputChange('guestCapacityMax', parseInt(e.target.value) || undefined)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="specialities">Specialities</Label>
                        <Textarea
                          id="specialities"
                          value={formData.specialities || ''}
                          onChange={(e) => handleInputChange('specialities', e.target.value)}
                          placeholder="What makes your service special?"
                        />
                      </div>
                      <div>
                        <Label>Facilities Available</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {facilities.map((facility) => (
                            <div key={facility} className="flex items-center space-x-2">
                              <Checkbox
                                id={`facility-${facility}`}
                                checked={formData.facilitiesAvailable?.includes(facility) || false}
                                onCheckedChange={(checked) =>
                                  handleArrayFieldChange('facilitiesAvailable', facility, checked as boolean)
                                }
                              />
                              <Label htmlFor={`facility-${facility}`} className="text-sm">{facility}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="advancePaymentPercent">Advance Payment (%)</Label>
                          <Input
                            id="advancePaymentPercent"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.advancePaymentPercent || ''}
                            onChange={(e) => handleInputChange('advancePaymentPercent', parseInt(e.target.value) || undefined)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="refundPolicy">Refund Policy</Label>
                          <Textarea
                            id="refundPolicy"
                            value={formData.refundPolicy || ''}
                            onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                            placeholder="Describe your refund policy"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Payment Modes Accepted</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                          {paymentModes.map((mode) => (
                            <div key={mode} className="flex items-center space-x-2">
                              <Checkbox
                                id={`payment-${mode}`}
                                checked={formData.paymentModesAccepted?.includes(mode) || false}
                                onCheckedChange={(checked) =>
                                  handleArrayFieldChange('paymentModesAccepted', mode, checked as boolean)
                                }
                              />
                              <Label htmlFor={`payment-${mode}`} className="text-sm">{mode}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="about">About Your Business *</Label>
                        <Textarea
                          id="about"
                          rows={4}
                          value={formData.about || ''}
                          onChange={(e) => handleInputChange('about', e.target.value)}
                          placeholder="Tell us about your business, experience, and what makes you unique"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="awards">Awards &amp; Recognition</Label>
                        <Textarea
                          id="awards"
                          value={formData.awards || ''}
                          onChange={(e) => handleInputChange('awards', e.target.value)}
                          placeholder="Any awards, certifications, or recognition received"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notableClients">Notable Clients</Label>
                        <Textarea
                          id="notableClients"
                          value={formData.notableClients || ''}
                          onChange={(e) => handleInputChange('notableClients', e.target.value)}
                          placeholder="Mention any notable clients or events you've handled"
                        />
                      </div>
                      <div>
                        <Label htmlFor="videoLinks">Video Links (YouTube/Vimeo, comma-separated)</Label>
                        <Textarea
                          id="videoLinks"
                          value={formData.videoLinks || ''}
                          onChange={(e) => handleInputChange('videoLinks', e.target.value)}
                          placeholder="https://youtube.com/watch?v=..., https://vimeo.com/..."
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Portfolio Tab */}
                  <TabsContent value="portfolio">
                    <div className="space-y-8">
                      <div>
                        <Label>Business Logo</Label>
                        <div className="flex items-center gap-4 mt-2">
                          {vendor.logoUrl && (
                            <img src={vendor.logoUrl} alt="Current Logo" className="w-16 h-16 rounded object-cover" />
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'logoFile')}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label htmlFor="logo-upload" className="cursor-pointer">
                              <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                                <Upload size={16} />
                                {formData.logoFile ? formData.logoFile.name : 'Choose Logo'}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Cover Image</Label>
                        <div className="flex items-center gap-4 mt-2">
                          {vendor.coverImageUrl && (
                            <img src={vendor.coverImageUrl} alt="Current Cover" className="w-24 h-16 rounded object-cover" />
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'coverImageFile')}
                              className="hidden"
                              id="cover-upload"
                            />
                            <label htmlFor="cover-upload" className="cursor-pointer">
                              <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                                <Upload size={16} />
                                {formData.coverImageFile ? formData.coverImageFile.name : 'Choose Cover Image'}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Portfolio Images</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'portfolioFiles')}
                            className="hidden"
                            id="portfolio-upload"
                          />
                          <label htmlFor="portfolio-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              <Plus size={16} />
                              Add Images
                            </div>
                          </label>
                        </div>
                        {formData.portfolioFiles && formData.portfolioFiles.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-sm text-gray-600 block mb-2">New Images to Upload:</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {formData.portfolioFiles.map((file, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`New ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                                    New
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {formData.portfolioImages?.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Portfolio ${index + 1}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemovePortfolioImage(index)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                        {(!formData.portfolioImages || formData.portfolioImages.length === 0) && (
                          <div className="text-center py-12 text-gray-500">
                            <Camera size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No portfolio images uploaded yet.</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Video Portfolio</Label>
                        {formData.videoLinks && stringToArray(formData.videoLinks).length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {stringToArray(formData.videoLinks).map((link, index) => (
                              <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-2"
                                >
                                  <Globe size={16} />
                                  Video {index + 1}
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Globe size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No video links added yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={uploading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                    <p className="text-red-600">{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="mt-2">
                      Dismiss
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not editing: show the original dashboard (read-only)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {vendor.coverImageUrl && (
          <img
            src={vendor.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30" />

        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            <div className="relative">
              {vendor.logoUrl ? (
                <img
                  src={vendor.logoUrl}
                  alt={vendor.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
                  <Camera className="text-gray-500" size={32} />
                </div>
              )}
            </div>
            <div className="flex-1 text-white mb-4">
              <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-white bg-opacity-20 text-white">
                  {vendor.category}
                </Badge>
                <Badge className={vendor.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                  {vendor.status}
                </Badge>
              </div>
            </div>
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                <Eye size={16} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="business" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                <Building size={16} className="mr-2" />
                Business Info
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                <Settings size={16} className="mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4">
                <ImageIcon size={16} className="mr-2" />
                Portfolio
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="mt-2">
                Dismiss
              </Button>
            </div>
          )}

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">₹{vendor.startingPrice?.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Starting Price</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {vendor.guestCapacityMax || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Max Capacity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {vendor.serviceAreas?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Service Areas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {vendor.about || 'No description available.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Services */}
                <Card>
                  <CardHeader>
                    <CardTitle>Services Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {vendor.servicesOffered?.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="text-gray-400" size={18} />
                      <span>{vendor.mobileNumber}</span>
                      {vendor.mobileVerified && (
                        <CheckCircle className="text-green-500" size={16} />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="text-gray-400" size={18} />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-gray-400" size={18} />
                      <span>{vendor.city}, {vendor.state}</span>
                    </div>
                    {vendor.websiteOrSocial && (
                      <div className="flex items-center gap-3">
                        <Globe className="text-gray-400" size={18} />
                        <a
                          href={vendor.websiteOrSocial}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Advance Payment:</span>
                      <div className="font-semibold">
                        {vendor.advancePaymentPercent ? `${vendor.advancePaymentPercent}%` : 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Accepted Modes:</span>
                      <div className="flex flex-wrap gap-1">
                        {vendor.paymentModesAccepted?.map((mode, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Business Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vendor.yearOfEstablishment && (
                      <div className="flex items-center gap-3">
                        <Calendar className="text-gray-400" size={18} />
                        <span>Est. {vendor.yearOfEstablishment}</span>
                      </div>
                    )}
                    {vendor.awards && (
                      <div className="flex items-center gap-3">
                        <Award className="text-gray-400" size={18} />
                        <span>{vendor.awards}</span>
                      </div>
                    )}
                    {vendor.notableClients && (
                      <div className="flex items-center gap-3">
                        <Users className="text-gray-400" size={18} />
                        <span>{vendor.notableClients}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="business">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Business Name</Label>
                      <p className="font-semibold">{vendor.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Category</Label>
                      <p className="font-semibold">{vendor.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Year of Establishment</Label>
                      <p className="font-semibold">{vendor.yearOfEstablishment || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Username</Label>
                      <p className="font-semibold">{vendor.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Contact Person</Label>
                      <p className="font-semibold">{vendor.contactPersonName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Designation</Label>
                      <p className="font-semibold">{vendor.designation}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Mobile Number</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{vendor.mobileNumber}</p>
                        {vendor.mobileVerified && <CheckCircle className="text-green-500" size={16} />}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">WhatsApp Number</Label>
                      <p className="font-semibold">{vendor.whatsappNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Email</Label>
                      <p className="font-semibold">{vendor.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Website/Social</Label>
                      <p className="font-semibold">{vendor.websiteOrSocial || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location & Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">Address</Label>
                    <p className="font-semibold">{vendor.address}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">City</Label>
                      <p className="font-semibold">{vendor.city}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">State</Label>
                      <p className="font-semibold">{vendor.state}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Pin Code</Label>
                      <p className="font-semibold">{vendor.pinCode}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Service Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vendor.serviceAreas?.map((area, index) => (
                        <Badge key={index} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services &amp; Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Services Offered</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {vendor.servicesOffered?.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Starting Price (₹)</Label>
                    <p className="font-semibold">{vendor.startingPrice?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Min Guest Capacity</Label>
                    <p className="font-semibold">{vendor.guestCapacityMin || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Max Guest Capacity</Label>
                    <p className="font-semibold">{vendor.guestCapacityMax || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Specialities</Label>
                  <p className="font-semibold">{vendor.specialities || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Facilities Available</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {vendor.facilitiesAvailable?.map((facility, index) => (
                      <Badge key={index} variant="secondary">{facility}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Advance Payment (%)</Label>
                    <p className="font-semibold">{vendor.advancePaymentPercent ? `${vendor.advancePaymentPercent}%` : 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Refund Policy</Label>
                    <p className="font-semibold">{vendor.refundPolicy || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Payment Modes Accepted</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {vendor.paymentModesAccepted?.map((mode, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {mode}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">About</Label>
                  <p className="font-semibold">{vendor.about || 'No description available.'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Awards &amp; Recognition</Label>
                  <p className="font-semibold">{vendor.awards || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Notable Clients</Label>
                  <p className="font-semibold">{vendor.notableClients || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Video Links</Label>
                  <div className="flex flex-col gap-2 mt-1">
                    {vendor.videoLinks && vendor.videoLinks.length > 0 ? (
                      vendor.videoLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <Globe size={16} />
                          Video {index + 1}
                        </a>
                      ))
                    ) : (
                      <span className="text-gray-500">No video links added yet.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {vendor.portfolioImages?.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
                {(!vendor.portfolioImages || vendor.portfolioImages.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Camera size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No portfolio images uploaded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Video Links Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Video Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.videoLinks && vendor.videoLinks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.videoLinks.map((link, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <Globe size={16} />
                          Video {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Globe size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No video links added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}