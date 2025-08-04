"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchVendors,
  updateVendor,
  deleteVendor,
  setFilters,
  clearFilters,
  selectVendors,
  selectVendorLoading,
  selectVendorError,
  VendorType,
} from "@/lib/redux/features/vendorSlice";
import { AlertCircle, ImageIcon, Loader2Icon, SearchIcon, TrashIcon, FilterIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VendorFormState {
  name: string;
  type: VendorType;
  description: string;
  services: string[];
  basePrice: number;
  currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  images: File[];
  availableDays: string[];
  availableHours: string;
  status: 'active' | 'inactive';
}

const initialFormState: VendorFormState = {
  name: "",
  type: "other",
  description: "",
  services: [],
  basePrice: 0,
  currency: "USD",
  address: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  images: [],
  availableDays: [],
  availableHours: "",
  status: "active",
};

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'] as const;
const vendorTypes: VendorType[] = ['flower', 'catering', 'decoration', 'photography', 'music', 'other'];

export default function VendorsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const vendors = useSelector(selectVendors);
  const isLoading = useSelector(selectVendorLoading);
  const error = useSelector(selectVendorError);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<VendorType | ''>('');
  const [selectedCity, setSelectedCity] = useState("");
  const [editVendorForm, setEditVendorForm] = useState<VendorFormState | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.location.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !selectedType || vendor.type === selectedType;
    const matchesCity = !selectedCity || vendor.location.city.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesType && matchesCity;
  });

  const uniqueCities = Array.from(new Set(vendors.map(v => v.location.city))).filter(Boolean);

  const handleTypeFilter = (type: VendorType | '') => {
    setSelectedType(type);
    dispatch(setFilters({ type }));
  };

  const handleCityFilter = (city: string) => {
    setSelectedCity(city);
    dispatch(setFilters({ city }));
  };

  const clearAllFilters = () => {
    setSelectedType('');
    setSelectedCity('');
    setSearchQuery('');
    dispatch(clearFilters());
  };

  const handleEdit = async () => {
    if (!editVendorForm || !selectedVendorId || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("id", selectedVendorId);
      formData.append("name", editVendorForm.name);
      formData.append("type", editVendorForm.type);
      formData.append("description", editVendorForm.description);
      formData.append("services", editVendorForm.services.join(','));
      formData.append("basePrice", editVendorForm.basePrice.toString());
      formData.append("currency", editVendorForm.currency);
      formData.append("address", editVendorForm.address);
      formData.append("city", editVendorForm.city);
      formData.append("state", editVendorForm.state);
      formData.append("country", editVendorForm.country);
      formData.append("phone", editVendorForm.phone);
      formData.append("email", editVendorForm.email);
      if (editVendorForm.website) {
        formData.append("website", editVendorForm.website);
      }
      formData.append("availableDays", editVendorForm.availableDays.join(','));
      formData.append("availableHours", editVendorForm.availableHours);
      formData.append("status", editVendorForm.status);

      editVendorForm.images.forEach(image => {
        formData.append("images", image);
      });

      await dispatch(updateVendor({ id: selectedVendorId, data: formData })).unwrap();
      toast.success("Vendor updated successfully");
      setIsEditDialogOpen(false);
      setEditVendorForm(null);
      setSelectedVendorId(null);
    } catch (err: any) {
      toast.error(err.message || "Error updating vendor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVendorId || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await dispatch(deleteVendor(selectedVendorId)).unwrap();
      toast.success("Vendor deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedVendorId(null);
    } catch (err: any) {
      toast.error(err.message || "Error deleting vendor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FilterIcon className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <Label>Vendor Type</Label>
                <Select value={selectedType} onValueChange={(value: VendorType | '') => handleTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {vendorTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2">
                <Label>City</Label>
                <Select value={selectedCity} onValueChange={handleCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenuItem 
                className="justify-center text-blue-600"
                onClick={clearAllFilters}
              >
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Base Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={vendor.portfolio.images[0]} 
                          alt={vendor.name}
                        />
                        <AvatarFallback>
                          {vendor.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{vendor.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {vendor.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {vendor.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {vendor.contactInfo.phone}
                      <div className="text-gray-500">{vendor.contactInfo.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {vendor.location.city}, {vendor.location.country}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {vendor.pricing.basePrice} {vendor.pricing.currency}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={vendor.status === 'active' ? 'default' : 'secondary'}
                    >
                      {vendor.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVendorId(vendor.id);
                          setEditVendorForm({
                            name: vendor.name,
                            type: vendor.type,
                            description: vendor.description,
                            services: vendor.services,
                            basePrice: vendor.pricing.basePrice,
                            currency: vendor.pricing.currency,
                            address: vendor.location.address,
                            city: vendor.location.city,
                            state: vendor.location.state,
                            country: vendor.location.country,
                            phone: vendor.contactInfo.phone,
                            email: vendor.contactInfo.email,
                            website: vendor.contactInfo.website,
                            images: [],
                            availableDays: vendor.availability.days,
                            availableHours: vendor.availability.hours,
                            status: vendor.status,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedVendorId(vendor.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          {editVendorForm && (
            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editVendorForm.name}
                      onChange={(e) =>
                        setEditVendorForm({ ...editVendorForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={editVendorForm.type}
                      onValueChange={(value: VendorType) =>
                        setEditVendorForm({ ...editVendorForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editVendorForm.description}
                      onChange={(e) =>
                        setEditVendorForm({ ...editVendorForm, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="services">Services (comma-separated)</Label>
                    <Input
                      id="services"
                      value={editVendorForm.services.join(', ')}
                      onChange={(e) =>
                        setEditVendorForm({
                          ...editVendorForm,
                          services: e.target.value.split(',').map(s => s.trim()),
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="basePrice">Base Price</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={editVendorForm.basePrice}
                        onChange={(e) =>
                          setEditVendorForm({
                            ...editVendorForm,
                            basePrice: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={editVendorForm.currency}
                        onValueChange={(value: typeof currencies[number]) =>
                          setEditVendorForm({ ...editVendorForm, currency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(currency => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editVendorForm.address}
                      onChange={(e) =>
                        setEditVendorForm({ ...editVendorForm, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={editVendorForm.city}
                        onChange={(e) =>
                          setEditVendorForm({ ...editVendorForm, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={editVendorForm.state}
                        onChange={(e) =>
                          setEditVendorForm({ ...editVendorForm, state: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editVendorForm.country}
                      onChange={(e) =>
                        setEditVendorForm({ ...editVendorForm, country: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editVendorForm.phone}
                      onChange={(e) =>
                        setEditVendorForm({ ...editVendorForm, phone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editVendorForm.email}
                      onChange={(e) =>
                        setEditVendorForm({ ...editVendorForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      value={editVendorForm.website}
                      onChange={(e) =>
                        setEditVendorForm({ ...editVendorForm, website: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={editVendorForm.status}
                      onValueChange={(value: 'active' | 'inactive') =>
                        setEditVendorForm({ ...editVendorForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditVendorForm(null);
                    setSelectedVendorId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedVendorId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
