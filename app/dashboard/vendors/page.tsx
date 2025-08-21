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
import { uploadImageClient } from "@/lib/firebase-client";
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
} from "lucide-react";

import Link from "next/link";

// Types (matching your vendor interface)
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

interface Vendor {
  id: string;
  businessName: string;
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

// Helper function to safely convert array or string to comma-separated string
const arrayToString = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
};

// Helper function to safely convert comma-separated string to array
const stringToArray = (value: string): string[] => {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

// Form state interface
interface VendorFormState {
  businessName: string;
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
  servicesOffered: string;
  startingPrice: number;
  guestCapacityMin?: number;
  guestCapacityMax?: number;
  specialities?: string;
  logoUrl: string;
  coverImageUrl: string;
  portfolioImages: string[];
  videoLinks?: string;
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
  // File uploads
  logoFile?: File;
  coverImageFile?: File;
  portfolioFiles?: File[];
  removeImages?: boolean;
}

const categories: VendorCategory[] = [
  "Venue",
  "Planner",
  "Photographer",
  "Decorator",
  "Caterer",
  "Makeup",
  "Entertainment",
  "Others",
];
const serviceAreas: ServiceArea[] = [
  "Local City",
  "Statewide",
  "Pan India",
  "International",
];
const paymentModes: PaymentMode[] = [
  "UPI",
  "Cash",
  "Bank Transfer",
  "Card",
  "Other",
];

const statusColors: Record<Vendor["status"], string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
};

const getInitialFormState = (vendor: Vendor | null): VendorFormState | null => {
  if (!vendor) return null;
  return {
    businessName: vendor.businessName || "",
    category: vendor.category || "Venue",
    yearOfEstablishment: vendor.yearOfEstablishment || "",
    contactPersonName: vendor.contactPersonName || "",
    designation: vendor.designation || "Owner",
    mobileNumber: vendor.mobileNumber || "",
    mobileVerified: vendor.mobileVerified || false,
    whatsappNumber: vendor.whatsappNumber || "",
    email: vendor.email || "",
    websiteOrSocial: vendor.websiteOrSocial || "",
    address: vendor.address || "",
    city: vendor.city || "",
    state: vendor.state || "",
    pinCode: vendor.pinCode || "",
    serviceAreas: vendor.serviceAreas || [],
    servicesOffered: arrayToString(vendor.servicesOffered),
    startingPrice: vendor.startingPrice || 0,
    guestCapacityMin: vendor.guestCapacityMin || undefined,
    guestCapacityMax: vendor.guestCapacityMax || undefined,
    specialities: vendor.specialities || "",
    logoUrl: vendor.logoUrl || "",
    coverImageUrl: vendor.coverImageUrl || "",
    portfolioImages: vendor.portfolioImages || [],
    videoLinks: vendor.videoLinks ? arrayToString(vendor.videoLinks) : "",
    about: vendor.about || "",
    awards: vendor.awards || "",
    notableClients: vendor.notableClients || "",
    advancePaymentPercent: vendor.advancePaymentPercent || undefined,
    refundPolicy: vendor.refundPolicy || "",
    paymentModesAccepted: vendor.paymentModesAccepted || [],
    username: vendor.username || "",
    agreedToTerms: vendor.agreedToTerms || false,
    status: vendor.status || "inactive",
    createdAt: vendor.createdAt || "",
    updatedAt: vendor.updatedAt || "",
    logoFile: undefined,
    coverImageFile: undefined,
    portfolioFiles: [],
    removeImages: false,
  };
};

// File upload helper functions
const uploadFile = async (file: File): Promise<string> => {
  try {
    if (file.type.startsWith("image/")) {
      return await uploadImageClient(file);
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error: any) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

const uploadFiles = async (files: File[]): Promise<string[]> => {
  if (!files.length) return [];
  try {
    const uploadPromises = files.map((file) => uploadFile(file));
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    throw new Error(`Failed to upload files: ${error.message}`);
  }
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

  // For file uploads in portfolio
  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof VendorFormState
  ) => {
    if (!formData) return;
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData({
      ...formData,
      [field]: files,
    });
  };

  // For About and other text fields
  const handleInputChange = (field: keyof VendorFormState, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Save handler for settings tab
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !vendor) return;
    setUploading(true);
    setError(null);

    try {
      // Handle portfolio image uploads if any
      let portfolioImages = vendor.portfolioImages || [];
      if (formData.portfolioFiles && formData.portfolioFiles.length > 0) {
        const uploaded = await uploadFiles(formData.portfolioFiles);
        portfolioImages = [...portfolioImages, ...uploaded];
      }

      // Prepare FormData for multipart/form-data
      const fd = new FormData();

      // Append all fields to FormData
      fd.append("businessName", formData.businessName);
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
      fd.append("startingPrice", String(formData.startingPrice));
      if (formData.guestCapacityMin !== undefined) fd.append("guestCapacityMin", String(formData.guestCapacityMin));
      if (formData.guestCapacityMax !== undefined) fd.append("guestCapacityMax", String(formData.guestCapacityMax));
      if (formData.specialities) fd.append("specialities", formData.specialities);

      // Images/portfolio
      fd.append("logoUrl", formData.logoUrl);
      fd.append("coverImageUrl", formData.coverImageUrl);
      portfolioImages.forEach((img) => fd.append("portfolioImages", img));
      if (formData.videoLinks) {
        stringToArray(formData.videoLinks).forEach((link) => fd.append("videoLinks", link));
      }

      fd.append("about", formData.about);
      if (formData.awards) fd.append("awards", formData.awards);
      if (formData.notableClients) fd.append("notableClients", formData.notableClients);
      if (formData.advancePaymentPercent !== undefined) fd.append("advancePaymentPercent", String(formData.advancePaymentPercent));
      if (formData.refundPolicy) fd.append("refundPolicy", formData.refundPolicy);
      formData.paymentModesAccepted.forEach((mode) => fd.append("paymentModesAccepted", mode));
      fd.append("username", formData.username);
      fd.append("agreedToTerms", String(formData.agreedToTerms));
      fd.append("status", formData.status);
      fd.append("createdAt", formData.createdAt);
      fd.append("updatedAt", formData.updatedAt);

      // File uploads (logo, cover, portfolio)
      if (formData.logoFile) fd.append("logoFile", formData.logoFile);
      if (formData.coverImageFile) fd.append("coverImageFile", formData.coverImageFile);
      if (formData.portfolioFiles && formData.portfolioFiles.length > 0) {
        formData.portfolioFiles.forEach((file) => fd.append("portfolioFiles", file));
      }
      if (formData.removeImages) fd.append("removeImages", "true");

      await dispatch(updateVendor({ id: vendor.id, data: fd }) as any).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
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
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                  alt={vendor.businessName}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
                  <Camera className="text-gray-500" size={32} />
                </div>
              )}
            </div>
            <div className="flex-1 text-white mb-4">
              <h1 className="text-3xl font-bold mb-2">{vendor.businessName}</h1>
              <div className="flex items-center gap-4">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {vendor.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  vendor.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {vendor.status}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing((prev) => !prev)}
                className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isEditing ? "Cancel Edit" : "Edit Profile"}
              >
                <Edit size={20} />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {['overview', 'services', 'portfolio', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                aria-current={activeTab === tab ? "page" : undefined}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
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
              </div>

              {/* About */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                {isEditing ? (
                  <Textarea
                    rows={4}
                    value={formData?.about || ''}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    className="w-full"
                    placeholder="Tell us about your business..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {vendor.about || 'No description available.'}
                  </p>
                )}
              </div>

              {/* Services */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.servicesOffered?.map((service, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-3">
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
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                <div className="space-y-3">
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
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Highlights */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Business Highlights</h2>
                <div className="space-y-3">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Portfolio</h2>
              {isEditing && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'portfolioFiles')}
                    className="hidden"
                    id="portfolio-upload"
                  />
                  <label
                    htmlFor="portfolio-upload"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add Images
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendor.portfolioImages?.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {isEditing && (
                    <button className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {(!vendor.portfolioImages || vendor.portfolioImages.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <p>No portfolio images uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Fix: Add missing edit form rendering for 'settings' tab */}
        {isEditing && activeTab === 'settings' && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow-sm mt-8">
            {/* Example: Only About field for brevity, add more fields as needed */}
            <div className="mb-4">
              <Label className="block text-gray-700 font-medium mb-2" htmlFor="about">
                About
              </Label>
              <Textarea
                id="about"
                rows={4}
                value={formData?.about || ''}
                onChange={(e) => handleInputChange('about', e.target.value)}
                className="w-full"
                placeholder="Tell us about your business..."
              />
            </div>
            {/* Add more editable fields here as needed */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
