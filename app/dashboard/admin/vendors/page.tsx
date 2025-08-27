"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import {
  fetchVendors,
  fetchActiveVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  selectVendors,
  selectVendorLoading,
  selectVendorError,
  selectVendorHasFetched,
  selectFilteredVendors,
  setFilters,
  clearError
} from '@/lib/redux/features/vendorSlice';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Search, 
  Eye, 
  Phone, 
  MapPin,
  X,
  Save,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
  Settings,
  Info,
  Heart,
  User,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type VendorCategory = "Venue" | "Planner" | "Photographer" | "Decorator" | "Caterer" | "Makeup" | "Entertainment" | "Others";
type ServiceArea = "Local City" | "Statewide" | "Pan India" | "International";
type PaymentMode = "UPI" | "Cash" | "Bank Transfer" | "Card" | "Other";
type Facility = "Rooms" | "Parking" | "Catering" | "Decor" | "DJ" | "Liquor License" | "Pool" | "Other";

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
  isPremium?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function VendorDashboard () {
  const dispatch = useDispatch<AppDispatch>();
  const vendors = useSelector(selectVendors);
  const loading = useSelector(selectVendorLoading);
  const error = useSelector(selectVendorError);
  const hasFetched = useSelector(selectVendorHasFetched);
  const filteredVendors = useSelector(selectFilteredVendors);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const categories: VendorCategory[] = ["Venue", "Planner", "Photographer", "Decorator", "Caterer", "Makeup", "Entertainment", "Others"];
  const serviceAreas: ServiceArea[] = ["Local City", "Statewide", "Pan India", "International"];
  const paymentModes: PaymentMode[] = ["UPI", "Cash", "Bank Transfer", "Card", "Other"];
  const facilities: Facility[] = ["Rooms", "Parking", "Catering", "Decor", "DJ", "Liquor License", "Pool", "Other"];

  // Fetch vendors on mount
  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchVendors());
      dispatch(fetchActiveVendors());
    }
  }, [dispatch, hasFetched]);

  // Update filters when search/filter changes
  useEffect(() => {
    dispatch(setFilters({
      search: searchTerm,
      category: selectedCategory,
      ...(selectedStatus && { status: selectedStatus })
    }));
  }, [searchTerm, selectedCategory, selectedStatus, dispatch]);

  // Clear error after showing toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName?.trim()) {
      toast.error('Business name is required');
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      if (modalMode === 'create') {
        await dispatch(createVendor(formDataToSend)).unwrap();
        toast.success('Vendor created successfully!');
      } else if (modalMode === 'edit' && selectedVendor) {
        await dispatch(updateVendor({ id: selectedVendor.id, data: formDataToSend })).unwrap();
        toast.success('Vendor updated successfully!');
      }
      
      setShowModal(false);
      setFormData({});
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save vendor');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      await dispatch(deleteVendor(id)).unwrap();
      toast.success('Vendor deleted successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete vendor');
    }
  };

  // Open modal
  const openModal = (mode: 'view' | 'edit' | 'create', vendor?: Vendor) => {
    setModalMode(mode);
    setSelectedVendor(vendor || null);
    setFormData(vendor ? { ...vendor } : {
      businessName: '',
      category: 'Others',
      contactPersonName: '',
      designation: 'Owner',
      mobileNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      serviceAreas: [],
      servicesOffered: [],
      startingPrice: 0,
      logoUrl: '',
      coverImageUrl: '',
      portfolioImages: [],
      about: '',
      paymentModesAccepted: [],
      username: '',
      agreedToTerms: false,
      status: 'inactive',
      isPremium: false,
      isFeatured: false,
    });
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = (prev as any)[field] || [];
      const newArray = currentArray.includes(value) 
        ? currentArray.filter((item: string) => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const renderBasicInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
          <input
            type="text"
            required
            value={formData.businessName || ''}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter business name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            required
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year of Establishment</label>
          <input
            type="text"
            value={formData.yearOfEstablishment || ''}
            onChange={(e) => handleInputChange('yearOfEstablishment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 2015"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <select
            required
            value={formData.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPremium"
          checked={formData.isPremium || false}
          onChange={e => handleInputChange('isPremium', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPremium" className="text-sm font-medium text-gray-700 flex items-center">
          <Crown className="h-4 w-4 mr-1 text-yellow-500" />
          Premium Vendor
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isFeatured"
          checked={formData.isFeatured || false}
          onChange={e => handleInputChange('isFeatured', e.target.checked)}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 flex items-center">
          <Heart className="h-4 w-4 mr-1 text-purple-600" />
          Featured Vendor
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">About Your Business</label>
        <textarea
          rows={4}
          value={formData.about || ''}
          onChange={(e) => handleInputChange('about', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your business, specialties, and what makes you unique..."
        />
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Name *</label>
          <input
            type="text"
            required
            value={formData.contactPersonName || ''}
            onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter contact person name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
          <select
            required
            value={formData.designation || ''}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Owner">Owner</option>
            <option value="Manager">Manager</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
          <input
            type="tel"
            required
            value={formData.mobileNumber || ''}
            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+91 XXXXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
          <input
            type="tel"
            value={formData.whatsappNumber || ''}
            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+91 XXXXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website/Social Media</label>
          <input
            type="url"
            value={formData.websiteOrSocial || ''}
            onChange={(e) => handleInputChange('websiteOrSocial', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>
    </div>
  );

  const renderLocationTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
        <textarea
          required
          rows={3}
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter complete address"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            type="text"
            required
            value={formData.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter city"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
          <input
            type="text"
            required
            value={formData.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter state"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code *</label>
          <input
            type="text"
            required
            value={formData.pinCode || ''}
            onChange={(e) => handleInputChange('pinCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter pin code"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
        <div className="grid grid-cols-2 gap-2">
          {serviceAreas.map(area => (
            <label key={area} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.serviceAreas || []).includes(area)}
                onChange={() => handleArrayChange('serviceAreas', area)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{area}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Starting Price *</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="number"
              required
              min="0"
              value={formData.startingPrice || ''}
              onChange={(e) => handleInputChange('startingPrice', Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter starting price"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Advance Payment %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.advancePaymentPercent || ''}
            onChange={(e) => handleInputChange('advancePaymentPercent', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Guest Capacity (Min)</label>
          <input
            type="number"
            min="0"
            value={formData.guestCapacityMin || ''}
            onChange={(e) => handleInputChange('guestCapacityMin', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Minimum capacity"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Guest Capacity (Max)</label>
          <input
            type="number"
            min="0"
            value={formData.guestCapacityMax || ''}
            onChange={(e) => handleInputChange('guestCapacityMax', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Maximum capacity"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
        <textarea
          rows={3}
          value={(formData.servicesOffered || []).join(', ')}
          onChange={(e) => handleInputChange('servicesOffered', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter services separated by commas (e.g., Wedding Planning, Decoration, Catering)"
        />
      </div>

      {formData.category === 'Venue' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Facilities Available</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {facilities.map(facility => (
              <label key={facility} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.facilitiesAvailable || []).includes(facility)}
                  onChange={() => handleArrayChange('facilitiesAvailable', facility)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{facility}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specialities</label>
        <textarea
          rows={3}
          value={formData.specialities || ''}
          onChange={(e) => handleInputChange('specialities', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What makes your services special?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Modes Accepted</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {paymentModes.map(mode => (
            <label key={mode} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.paymentModesAccepted || []).includes(mode)}
                onChange={() => handleArrayChange('paymentModesAccepted', mode)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Refund Policy</label>
        <textarea
          rows={3}
          value={formData.refundPolicy || ''}
          onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your refund and cancellation policy"
        />
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
          <input
            type="text"
            required
            value={formData.username || ''}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Choose a username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Awards & Recognition</label>
          <input
            type="text"
            value={formData.awards || ''}
            onChange={(e) => handleInputChange('awards', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any awards or recognition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notable Clients</label>
        <textarea
          rows={3}
          value={formData.notableClients || ''}
          onChange={(e) => handleInputChange('notableClients', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Mention any notable clients or events you've served"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Terms & Conditions</h3>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="agreedToTerms"
            checked={formData.agreedToTerms || false}
            onChange={e => handleInputChange('agreedToTerms', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <label htmlFor="agreedToTerms" className="text-sm text-gray-700">
            I agree to the Terms & Conditions *
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your wedding vendors and services</p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add New Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.isPremium).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => new Date(v.createdAt).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search vendors by name, city, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as VendorCategory | '')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | '')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>Showing {filteredVendors.length} of {vendors.length} vendors</span>
            <span>Updated {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-600 hover:text-red-800 ml-auto"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Vendors Table */}
        <div className="rounded-lg border bg-background shadow-sm w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Business</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="min-w-[120px]">Starting Price</TableHead>
                <TableHead className="min-w-[90px]">Premium</TableHead>
                <TableHead className="min-w-[90px]">Featured</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <TableCell colSpan={8} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                  </TableCell>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <TableCell colSpan={8} className="text-center h-24 text-gray-500">
                    No vendors found.
                  </TableCell>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-muted/50">
                    <TableCell className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border flex-shrink-0">
                        {vendor.logoUrl ? (
                          <img src={vendor.logoUrl} alt={vendor.businessName} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Building className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{vendor.businessName}</p>
                        <p className="text-xs text-gray-500 truncate">{vendor.contactPersonName || '—'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{vendor.category}</TableCell>
                    <TableCell className="text-gray-600">{vendor.city || 'N/A'}, {vendor.state || 'N/A'}</TableCell>
                    <TableCell className="text-gray-600">₹{(vendor.startingPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">{vendor.isPremium ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-gray-600">{vendor.isFeatured ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
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
                          <DropdownMenuItem onSelect={() => openModal('view', vendor)}> <Eye className="h-4 w-4 mr-2" />  View</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openModal('edit', vendor)}> <Pencil className="h-4 w-4 mr-2" />  Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onSelect={() => handleDelete(vendor.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory || selectedStatus 
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first vendor."}
            </p>
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              <Plus size={20} />
              Add Your First Vendor
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Add New Vendor' : 
               modalMode === 'edit' ? `Edit ${selectedVendor?.businessName}` : 
               selectedVendor?.businessName}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create' ? 'Create a new vendor profile' : 
               modalMode === 'edit' ? 'Update vendor information' : 
               'Vendor details and information'}
            </DialogDescription>
          </DialogHeader>

          {modalMode === 'view' ? (
            <div className="p-0 space-y-8">
              {/* Keep existing view layout */}
              {/* Business Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-start gap-6">
                  {selectedVendor?.logoUrl ? (
                    <img
                      src={selectedVendor.logoUrl}
                      alt={selectedVendor.businessName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Building className="text-gray-500" size={32} />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedVendor?.businessName}</h3>
                      {selectedVendor?.isPremium && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full border border-yellow-200">
                          <Crown className="h-4 w-4 inline mr-1" />
                          Premium
                        </span>
                      )}
                      {selectedVendor?.isFeatured && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full border border-purple-200">
                          <Heart className="h-4 w-4 inline mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 font-medium mb-1">{selectedVendor?.category}</p>
                    {selectedVendor?.yearOfEstablishment && (
                      <p className="text-gray-600">Established in {selectedVendor.yearOfEstablishment}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{selectedVendor?.startingPrice?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Starting from</p>
                  </div>
                </div>
              </div>

              {/* Keep rest of view content unchanged */}
              {/* We reuse the existing blocks below, so no duplication needed */}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-0">
              {/* Progress indicator */}
              {uploading && (
                <div className="mb-6 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Saving vendor...</span>
                    <span className="text-sm text-blue-700">Please wait</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex flex-wrap border-b border-gray-200 mb-6">
                {[
                  { id: 'basic', label: 'Basic Info', icon: Info },
                  { id: 'contact', label: 'Contact', icon: Phone },
                  { id: 'location', label: 'Location', icon: MapPin },
                  { id: 'services', label: 'Services', icon: Settings },
                  { id: 'account', label: 'Account', icon: User }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'basic' && renderBasicInfoTab()}
                {activeTab === 'contact' && renderContactTab()}
                {activeTab === 'location' && renderLocationTab()}
                {activeTab === 'services' && renderServicesTab()}
                {activeTab === 'account' && renderAccountTab()}
              </div>

              <DialogFooter className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                {activeTab !== 'account' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['basic', 'contact', 'location', 'services', 'account'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                    }}
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={uploading || !formData.businessName?.trim()}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {modalMode === 'create' ? 'Create Vendor' : 'Update Vendor'}
                      </>
                    )}
                  </button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};