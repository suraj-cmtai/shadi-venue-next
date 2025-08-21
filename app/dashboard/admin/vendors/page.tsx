"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  X,
  Save,
  Camera
} from 'lucide-react';

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
  createdAt: string;
  updatedAt: string;
}

const VendorDashboard = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [uploading, setUploading] = useState(false);

  const categories: VendorCategory[] = ["Venue", "Planner", "Photographer", "Decorator", "Caterer", "Makeup", "Entertainment", "Others"];
  const serviceAreas: ServiceArea[] = ["Local City", "Statewide", "Pan India", "International"];
  const paymentModes: PaymentMode[] = ["UPI", "Cash", "Bank Transfer", "Card", "Other"];
  const facilities: Facility[] = ["Rooms", "Parking", "Catering", "Decor", "DJ", "Liquor License", "Pool", "Other"];

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/routes/vendor');
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = searchTerm === '' || 
      vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || vendor.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || vendor.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();

      // Handle file fields
      if ((formData as any).logoFile) {
        formDataToSend.append('logoFile', (formData as any).logoFile);
      }
      if ((formData as any).coverImageFile) {
        formDataToSend.append('coverImageFile', (formData as any).coverImageFile);
      }
      if ((formData as any).portfolioFiles) {
        ((formData as any).portfolioFiles as File[]).forEach((file: File, idx: number) => {
          formDataToSend.append('portfolioFiles', file);
        });
      }

      // Add all other form fields except file fields
      Object.entries(formData).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          key !== 'logoFile' &&
          key !== 'coverImageFile' &&
          key !== 'portfolioFiles'
        ) {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      const url = modalMode === 'create' ? '/api/routes/vendor' : `/api/routes/vendor/${selectedVendor?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        await fetchVendors();
        setShowModal(false);
        setFormData({});
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to save vendor');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`/api/routes/vendor/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchVendors();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete vendor');
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
      status: 'inactive'
    });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (fieldName === 'logoFile' || fieldName === 'coverImageFile') {
        setFormData(prev => ({
          ...prev,
          [fieldName]: files[0]
        }));
      } else if (fieldName === 'portfolioFiles') {
        setFormData(prev => ({
          ...prev,
          [fieldName]: Array.from(files)
        }));
      }
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <button
              onClick={() => openModal('create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Vendor
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as VendorCategory | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Total: {vendors.length} | Filtered: {filteredVendors.length}
          </div>
        </div>

        {/* Error Message */}
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

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {vendor.coverImageUrl && (
                    <img
                      src={vendor.coverImageUrl}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      vendor.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {vendor.logoUrl ? (
                      <img
                        src={vendor.logoUrl}
                        alt={vendor.businessName}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white -mt-8 relative z-10"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center -mt-8 relative z-10">
                        <Camera className="text-gray-500" size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{vendor.businessName}</h3>
                      <p className="text-sm text-blue-600 font-medium">{vendor.category}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      <span>{vendor.contactPersonName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{vendor.city}, {vendor.state}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-lg font-semibold text-green-600">
                      Starting from ₹{vendor.startingPrice?.toLocaleString() || 'N/A'}
                    </p>
                    {vendor.guestCapacityMin && vendor.guestCapacityMax && (
                      <p className="text-sm text-gray-600">
                        Capacity: {vendor.guestCapacityMin} - {vendor.guestCapacityMax} guests
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('view', vendor)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => openModal('edit', vendor)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">
                  {modalMode === 'create' ? 'Add New Vendor' : 
                   modalMode === 'edit' ? 'Edit Vendor' : 'Vendor Details'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {modalMode === 'view' ? (
                  // View Mode
                  <div className="space-y-6">
                    {/* Business Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Business Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Business Name</label>
                          <p className="text-gray-900">{selectedVendor?.businessName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <p className="text-gray-900">{selectedVendor?.category}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Year of Establishment</label>
                          <p className="text-gray-900">{selectedVendor?.yearOfEstablishment || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            selectedVendor?.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedVendor?.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                          <p className="text-gray-900">{selectedVendor?.contactPersonName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Designation</label>
                          <p className="text-gray-900">{selectedVendor?.designation}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                          <p className="text-gray-900">{selectedVendor?.mobileNumber}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-gray-900">{selectedVendor?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Location & Coverage</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <p className="text-gray-900">{selectedVendor?.address}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <p className="text-gray-900">{selectedVendor?.city}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <p className="text-gray-900">{selectedVendor?.state}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                          <p className="text-gray-900">{selectedVendor?.pinCode}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Service Areas</label>
                          <p className="text-gray-900">{selectedVendor?.serviceAreas.join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Services & Pricing */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Services & Pricing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Starting Price</label>
                          <p className="text-gray-900">₹{selectedVendor?.startingPrice?.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Guest Capacity</label>
                          <p className="text-gray-900">
                            {selectedVendor?.guestCapacityMin && selectedVendor?.guestCapacityMax
                              ? `${selectedVendor.guestCapacityMin} - ${selectedVendor.guestCapacityMax}`
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Services Offered</label>
                          <p className="text-gray-900">{selectedVendor?.servicesOffered.join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedVendor?.logoUrl && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Logo</p>
                            <img src={selectedVendor.logoUrl} alt="Logo" className="w-full h-20 object-cover rounded" />
                          </div>
                        )}
                        {selectedVendor?.coverImageUrl && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Cover Image</p>
                            <img src={selectedVendor.coverImageUrl} alt="Cover" className="w-full h-20 object-cover rounded" />
                          </div>
                        )}
                        {selectedVendor?.portfolioImages.map((img, index) => (
                          <div key={index}>
                            <p className="text-sm font-medium text-gray-700 mb-2">Portfolio {index + 1}</p>
                            <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-20 object-cover rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit/Create Mode
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Business Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Basic Business Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.businessName || ''}
                            onChange={(e) => handleInputChange('businessName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                          <select
                            required
                            value={formData.category || ''}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year of Establishment</label>
                          <input
                            type="text"
                            value={formData.yearOfEstablishment || ''}
                            onChange={(e) => handleInputChange('yearOfEstablishment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                          <select
                            required
                            value={formData.status || ''}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.contactPersonName || ''}
                            onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                          <select
                            required
                            value={formData.designation || ''}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Owner">Owner</option>
                            <option value="Manager">Manager</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                          <input
                            type="tel"
                            required
                            value={formData.mobileNumber || ''}
                            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                          <input
                            type="tel"
                            value={formData.whatsappNumber || ''}
                            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website/Social Media</label>
                          <input
                            type="url"
                            value={formData.websiteOrSocial || ''}
                            onChange={(e) => handleInputChange('websiteOrSocial', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location & Coverage */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Location & Coverage</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <textarea
                            required
                            rows={3}
                            value={formData.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            required
                            value={formData.city || ''}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input
                            type="text"
                            required
                            value={formData.state || ''}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code *</label>
                          <input
                            type="text"
                            required
                            value={formData.pinCode || ''}
                            onChange={(e) => handleInputChange('pinCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas</label>
                          <div className="grid grid-cols-2 gap-2">
                            {serviceAreas.map(area => (
                              <label key={area} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={(formData.serviceAreas || []).includes(area)}
                                  onChange={() => handleArrayChange('serviceAreas', area)}
                                  className="mr-2"
                                />
                                <span className="text-sm">{area}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services & Pricing */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Services & Pricing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formData.startingPrice || ''}
                            onChange={(e) => handleInputChange('startingPrice', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Guest Capacity (Min)</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.guestCapacityMin || ''}
                            onChange={(e) => handleInputChange('guestCapacityMin', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Guest Capacity (Max)</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.guestCapacityMax || ''}
                            onChange={(e) => handleInputChange('guestCapacityMax', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.advancePaymentPercent || ''}
                            onChange={(e) => handleInputChange('advancePaymentPercent', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Services Offered</label>
                          <textarea
                            rows={3}
                            placeholder="Enter services separated by commas"
                            value={(formData.servicesOffered || []).join(', ')}
                            onChange={(e) => handleInputChange('servicesOffered', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Modes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Payment Modes</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {paymentModes.map(mode => (
                          <label key={mode} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(formData.paymentModesAccepted || []).includes(mode)}
                              onChange={() => handleArrayChange('paymentModesAccepted', mode)}
                              className="mr-2"
                            />
                            <span className="text-sm">{mode}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* File Uploads */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Images</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logoFile')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'coverImageFile')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Images</label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'portfolioFiles')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* About */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About</h3>
                      <textarea
                        rows={4}
                        value={formData.about || ''}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        placeholder="Describe your business..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Account Setup */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Account Setup</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                          <input
                            type="text"
                            required
                            value={formData.username || ''}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.agreedToTerms || false}
                            onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                            className="mr-2"
                          />
                          <label className="text-sm">Agreed to Terms & Conditions</label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                            {modalMode === 'create' ? 'Create Vendor' : 'Update Vendor'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;