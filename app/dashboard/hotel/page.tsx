"use client"

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/lib/redux/store'
import { 
  fetchHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  selectHotels,
  selectHotelLoading,
  selectHotelError
} from '@/lib/redux/features/hotelSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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

export default function HotelDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const hotels = useSelector(selectHotels)
  const isLoading = useSelector(selectHotelLoading)
  const error = useSelector(selectHotelError)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newHotelForm, setNewHotelForm] = useState<HotelFormState>(initialFormState)
  const [editHotelForm, setEditHotelForm] = useState<HotelFormState | null>(null)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchHotels())
  }, [dispatch])

  // Clean up object URLs when component unmounts or form changes
  useEffect(() => {
    return () => {
      if (newHotelForm.imageFiles.length > 0) {
        newHotelForm.images.forEach(image => {
          if (image.startsWith('blob:')) {
            URL.revokeObjectURL(image)
          }
        })
      }
    }
  }, [newHotelForm.imageFiles])

  useEffect(() => {
    return () => {
      if (editHotelForm?.imageFiles.length) {
        editHotelForm.images.forEach(image => {
          if (image.startsWith('blob:')) {
            URL.revokeObjectURL(image)
          }
        })
      }
    }
  }, [editHotelForm?.imageFiles])

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.location.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetCreateForm = () => {
    // Clean up any object URLs
    if (newHotelForm.imageFiles.length > 0) {
      newHotelForm.images.forEach(image => {
        if (image.startsWith('blob:')) {
          URL.revokeObjectURL(image)
        }
      })
    }
    setNewHotelForm(initialFormState)
  }

  const resetEditForm = () => {
    // Clean up any object URLs
    if (editHotelForm?.imageFiles.length) {
      editHotelForm.images.forEach(image => {
        if (image.startsWith('blob:')) {
          URL.revokeObjectURL(image)
        }
      })
    }
    setEditHotelForm(null)
    setSelectedHotelId(null)
  }

  const handleCreate = async () => {
    if (isSubmitting) return
    
    // Validation
    if (!newHotelForm.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!newHotelForm.description.trim()) {
      toast.error("Description is required")
      return
    }
    if (!newHotelForm.category.trim()) {
      toast.error("Category is required")
      return
    }
    if (!newHotelForm.location.address.trim()) {
      toast.error("Address is required")
      return
    }
    if (!newHotelForm.location.city.trim()) {
      toast.error("City is required")
      return
    }
    if (!newHotelForm.location.country.trim()) {
      toast.error("Country is required")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", newHotelForm.name.trim())
      formData.append("description", newHotelForm.description.trim())
      formData.append("category", newHotelForm.category.trim())
      formData.append("location", JSON.stringify(newHotelForm.location))
      formData.append("priceRange", JSON.stringify(newHotelForm.priceRange))
      formData.append("rating", newHotelForm.rating.toString())
      formData.append("status", newHotelForm.status)
      formData.append("amenities", newHotelForm.amenities.split(',').map(s => s.trim()).filter(Boolean).join(','))
      formData.append("rooms", JSON.stringify(newHotelForm.rooms))
      formData.append("contactInfo", JSON.stringify(newHotelForm.contactInfo))
      formData.append("policies", JSON.stringify(newHotelForm.policies))
      
      newHotelForm.imageFiles.forEach((file, index) => {
        formData.append(`images`, file)
      })

      await dispatch(createHotel(formData)).unwrap()
      resetCreateForm()
      setIsCreateDialogOpen(false)
      toast.success("Hotel created successfully!")
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to create hotel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!editHotelForm || !selectedHotelId || isSubmitting) return

    // Validation
    if (!editHotelForm.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!editHotelForm.description.trim()) {
      toast.error("Description is required")
      return
    }
    if (!editHotelForm.category.trim()) {
      toast.error("Category is required")
      return
    }
    if (!editHotelForm.location.address.trim()) {
      toast.error("Address is required")
      return
    }
    if (!editHotelForm.location.city.trim()) {
      toast.error("City is required")
      return
    }
    if (!editHotelForm.location.country.trim()) {
      toast.error("Country is required")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", editHotelForm.name.trim())
      formData.append("description", editHotelForm.description.trim())
      formData.append("category", editHotelForm.category.trim())
      formData.append("location", JSON.stringify(editHotelForm.location))
      formData.append("priceRange", JSON.stringify(editHotelForm.priceRange))
      formData.append("rating", editHotelForm.rating.toString())
      formData.append("status", editHotelForm.status)
      formData.append("amenities", editHotelForm.amenities.split(',').map(s => s.trim()).filter(Boolean).join(','))
      formData.append("rooms", JSON.stringify(editHotelForm.rooms))
      formData.append("contactInfo", JSON.stringify(editHotelForm.contactInfo))
      formData.append("policies", JSON.stringify(editHotelForm.policies))

      editHotelForm.imageFiles.forEach((file, index) => {
        formData.append(`images`, file)
      })

      if (editHotelForm.removeImages) {
        formData.append("removeImages", "true")
      }

      await dispatch(updateHotel({ id: selectedHotelId, data: formData })).unwrap()
      setIsEditDialogOpen(false)
      resetEditForm()
      toast.success("Hotel updated successfully!")
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to update hotel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedHotelId || isSubmitting) return

    setIsSubmitting(true)

    try {
      await dispatch(deleteHotel(selectedHotelId)).unwrap()
      setIsDeleteDialogOpen(false)
      setSelectedHotelId(null)
      toast.success("Hotel deleted successfully!")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete hotel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formState: HotelFormState,
    setFormState: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const files = Array.from(e.target.files || [])
    
    // Clean up previous object URLs
    formState.images.forEach(image => {
      if (image.startsWith('blob:')) {
        URL.revokeObjectURL(image)
      }
    })

    if (files.length > 0) {
      // Validate file types
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        toast.error("Only image files are allowed")
        return
      }

      // Validate file sizes (5MB limit each)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast.error("Images must be under 5MB each")
        return
      }

      const objectUrls = files.map(file => URL.createObjectURL(file))
      setFormState({
        ...formState,
        imageFiles: files,
        images: objectUrls,
        removeImages: false,
      })
    } else {
      setFormState({
        ...formState,
        imageFiles: [],
        images: [],
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Add your UI components here similar to the course page */}
      <div>Implementation in progress...</div>
    </motion.div>
  )
}