"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { 
  fetchCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  selectCourses,
  selectCourseLoading,
  selectCourseError
} from "@/lib/redux/features/courseSlice"
import { AppDispatch } from "@/lib/redux/store"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Updated Course interface: country instead of level
interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  country: string; // country is a string, not an enum
  price: number;
  feeType: string; // Field for fee duration/type (e.g., "per year", "full course fee")
  currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR'; // Field for currency
  status: 'active' | 'draft' | 'archived';
  description: string;
  instructor: string;
  enrollmentCount: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  learningHours?: string;
  modeOfDelivery?: 'Online' | 'On-campus' | 'Hybrid' | 'Self-paced';
  modeOfAssessment?: string;
  modules?: string[];
  prerequisites?: string[];
  careerOpportunities?: string[];
}

// Updated CourseFormState: country instead of level
interface CourseFormState {
  title: string;
  category: string;
  duration: string;
  country: string;
  price: number;
  feeType: string; // Field for fee duration/type (e.g., "per year", "full course fee")
  currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR'; // Field for currency
  status: 'active' | 'draft' | 'archived';
  description: string;
  instructor: string;
  enrollmentCount: number;
  image: string | null;
  imageFile: File | null;
  removeImage: boolean;
  learningHours: string;
  modeOfDelivery: '' | 'Online' | 'On-campus' | 'Hybrid' | 'Self-paced';
  modeOfAssessment: string;
  modules: string;
  prerequisites: string;
  careerOpportunities: string;
}

const initialFormState: CourseFormState = {
  title: "",
  category: "",
  duration: "",
  country: "",
  price: 0,
  feeType: "", // Initialize feeType
  currency: "USD", // Initialize currency
  status: "draft",
  description: "",
  instructor: "",
  enrollmentCount: 0,
  image: null,
  imageFile: null,
  removeImage: false,
  learningHours: "",
  modeOfDelivery: "",
  modeOfAssessment: "",
  modules: "",
  prerequisites: "",
  careerOpportunities: "",
};

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function CoursesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const courses = useSelector(selectCourses)
  const isLoading = useSelector(selectCourseLoading)
  const error = useSelector(selectCourseError)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newCourseForm, setNewCourseForm] = useState<CourseFormState>(initialFormState)
  const [editCourseForm, setEditCourseForm] = useState<CourseFormState | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  // Clean up object URLs when component unmounts or form changes
  useEffect(() => {
    return () => {
      if (newCourseForm.imageFile && newCourseForm.image) {
        URL.revokeObjectURL(newCourseForm.image)
      }
    }
  }, [newCourseForm.imageFile])

  useEffect(() => {
    return () => {
      if (editCourseForm?.imageFile && editCourseForm.image) {
        URL.revokeObjectURL(editCourseForm.image)
      }
    }
  }, [editCourseForm?.imageFile])

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.country && course.country.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const resetCreateForm = () => {
    // Clean up any object URL
    if (newCourseForm.imageFile && newCourseForm.image) {
      URL.revokeObjectURL(newCourseForm.image)
    }
    setNewCourseForm(initialFormState)
  }

  const resetEditForm = () => {
    // Clean up any object URL
    if (editCourseForm?.imageFile && editCourseForm.image) {
      URL.revokeObjectURL(editCourseForm.image)
    }
    setEditCourseForm(null)
    setSelectedCourseId(null)
  }

  const handleCreate = async () => {
    if (isSubmitting) return
    
    // Validation
    if (!newCourseForm.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!newCourseForm.description.trim()) {
      toast.error("Description is required")
      return
    }
    if (!newCourseForm.instructor.trim()) {
      toast.error("Instructor is required")
      return
    }
    if (!newCourseForm.category.trim()) {
      toast.error("Category is required")
      return
    }
    if (!newCourseForm.duration.trim()) {
      toast.error("Duration is required")
      return
    }
    if (!newCourseForm.country.trim()) {
      toast.error("Country is required")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", newCourseForm.title.trim())
      formData.append("description", newCourseForm.description.trim())
      formData.append("instructor", newCourseForm.instructor.trim())
      formData.append("category", newCourseForm.category.trim())
      formData.append("duration", newCourseForm.duration.trim())
      formData.append("country", newCourseForm.country.trim())
      formData.append("price", Math.max(0, newCourseForm.price).toString())
      formData.append("feeType", newCourseForm.feeType)
      formData.append("currency", newCourseForm.currency)
      formData.append("status", newCourseForm.status)
      formData.append("enrollmentCount", Math.max(0, newCourseForm.enrollmentCount).toString())
      formData.append("learningHours", newCourseForm.learningHours.trim())
      formData.append("modeOfDelivery", newCourseForm.modeOfDelivery)
      formData.append("modeOfAssessment", newCourseForm.modeOfAssessment.trim())
      formData.append("modules", newCourseForm.modules.split('.').map(s => s.trim()).filter(Boolean).join('.'))
      formData.append("prerequisites", newCourseForm.prerequisites.split('.').map(s => s.trim()).filter(Boolean).join('.'))
      formData.append("careerOpportunities", newCourseForm.careerOpportunities.split('.').map(s => s.trim()).filter(Boolean).join('.'))
      
      if (newCourseForm.imageFile) {
        formData.append("image", newCourseForm.imageFile)
      }

      await dispatch(createCourse(formData)).unwrap()
      resetCreateForm()
      setIsCreateDialogOpen(false)
      toast.success("Course created successfully!")
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (course: Course) => {
    setSelectedCourseId(course.id)
    setEditCourseForm({
      title: course.title,
      category: course.category,
      duration: course.duration,
      country: course.country || "",
      price: course.price,
      feeType: course.feeType || "", // Populate feeType
      currency: course.currency, // Populate currency
      status: course.status,
      description: course.description,
      instructor: course.instructor,
      enrollmentCount: course.enrollmentCount ?? 0,
      image: course.image ?? null,
      imageFile: null,
      removeImage: false,
      learningHours: course.learningHours || "",
      modeOfDelivery: course.modeOfDelivery || "",
      modeOfAssessment: course.modeOfAssessment || "",
      modules: course.modules?.join('.') || "",
      prerequisites: course.prerequisites?.join('.') || "",
      careerOpportunities: course.careerOpportunities?.join('.') || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!editCourseForm || !selectedCourseId || isSubmitting) return

    // Validation
    if (!editCourseForm.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!editCourseForm.description.trim()) {
      toast.error("Description is required")
      return
    }
    if (!editCourseForm.instructor.trim()) {
      toast.error("Instructor is required")
      return
    }
    if (!editCourseForm.category.trim()) {
      toast.error("Category is required")
      return
    }
    if (!editCourseForm.duration.trim()) {
      toast.error("Duration is required")
      return
    }
    if (!editCourseForm.country.trim()) {
      toast.error("Country is required")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", editCourseForm.title.trim())
      formData.append("description", editCourseForm.description.trim())
      formData.append("instructor", editCourseForm.instructor.trim())
      formData.append("category", editCourseForm.category.trim())
      formData.append("duration", editCourseForm.duration.trim())
      formData.append("country", editCourseForm.country.trim())
      formData.append("price", Math.max(0, editCourseForm.price).toString())
      formData.append("feeType", editCourseForm.feeType)
      formData.append("currency", editCourseForm.currency)
      formData.append("status", editCourseForm.status)
      formData.append("enrollmentCount", Math.max(0, editCourseForm.enrollmentCount).toString())
      formData.append("learningHours", editCourseForm.learningHours.trim())
      formData.append("modeOfDelivery", editCourseForm.modeOfDelivery)
      formData.append("modeOfAssessment", editCourseForm.modeOfAssessment.trim())
      formData.append("modules", editCourseForm.modules.split('.').map(s => s.trim()).filter(Boolean).join('.'))
      formData.append("prerequisites", editCourseForm.prerequisites.split('.').map(s => s.trim()).filter(Boolean).join('.'))
      formData.append("careerOpportunities", editCourseForm.careerOpportunities.split('.').map(s => s.trim()).filter(Boolean).join('.'))

      if (editCourseForm.imageFile) {
        formData.append("image", editCourseForm.imageFile)
      }
      if (editCourseForm.removeImage) {
        formData.append("removeImage", "true")
      }

      await dispatch(updateCourse({ id: selectedCourseId, data: formData })).unwrap()
      setIsEditDialogOpen(false)
      resetEditForm()
      toast.success("Course updated successfully!")
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to update course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCourseId || isSubmitting) return

    setIsSubmitting(true)

    try {
      await dispatch(deleteCourse(selectedCourseId)).unwrap()
      setIsDeleteDialogOpen(false)
      setSelectedCourseId(null)
      toast.success("Course deleted successfully!")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formState: CourseFormState,
    setFormState: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const file = e.target.files?.[0] || null
    
    // Clean up previous object URL
    if (formState.imageFile && formState.image && formState.image.startsWith('blob:')) {
      URL.revokeObjectURL(formState.image)
    }

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        e.target.value = '' // Reset input
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        e.target.value = '' // Reset input
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setFormState({
        ...formState,
        imageFile: file,
        image: objectUrl,
        removeImage: false, // Reset remove flag when new image is selected
      })
    } else {
      setFormState({
        ...formState,
        imageFile: null,
        // Keep existing image if no new file selected
      })
    }
  }

  const renderFormFields = (
    formState: CourseFormState,
    setFormState: React.Dispatch<React.SetStateAction<any>>
  ) => (
    <div className="grid gap-4 py-4 max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            placeholder="Enter course title"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
          <Input
            id="category"
            value={formState.category}
            onChange={(e) => setFormState({ ...formState, category: e.target.value })}
            placeholder="Enter course category"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="instructor">Instructor <span className="text-red-500">*</span></Label>
        <Input
          id="instructor"
          value={formState.instructor}
          onChange={(e) => setFormState({ ...formState, instructor: e.target.value })}
          placeholder="Enter instructor name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="duration">Duration <span className="text-red-500">*</span></Label>
          <Input
            id="duration"
            value={formState.duration}
            onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
            placeholder="e.g., 8 weeks, 3 months"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
          <Input
            id="country"
            value={formState.country}
            onChange={(e) => setFormState({ ...formState, country: e.target.value })}
            placeholder="Enter country"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price ($) <span className="text-red-500">*</span></Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formState.price}
            onChange={(e) => setFormState({ ...formState, price: Math.max(0, Number(e.target.value)) })}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="feeType">Fee Type</Label>
          <Input
            id="feeType"
            value={formState.feeType}
            onChange={(e) => setFormState({ ...formState, feeType: e.target.value })}
            placeholder="e.g., per year, full course fee"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formState.currency}
            onValueChange={(value: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR') =>
              setFormState({ ...formState, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formState.status}
            onValueChange={(value: 'active' | 'draft' | 'archived') =>
              setFormState({ ...formState, status: value })
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="enrollmentCount">Enrollment Count</Label>
          <Input
            id="enrollmentCount"
            type="number"
            min="0"
            value={formState.enrollmentCount}
            onChange={(e) => setFormState({ ...formState, enrollmentCount: Math.max(0, Number(e.target.value)) })}
            placeholder="0"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="learningHours">Learning Hours</Label>
          <Input
            id="learningHours"
            value={formState.learningHours}
            onChange={(e) => setFormState({ ...formState, learningHours: e.target.value })}
            placeholder="e.g., 40 hours"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="modeOfDelivery">Mode of Delivery</Label>
          <Select
            value={formState.modeOfDelivery}
            onValueChange={(value: '' | 'Online' | 'On-campus' | 'Hybrid' | 'Self-paced') =>
              setFormState({ ...formState, modeOfDelivery: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select delivery mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="On-campus">On-campus</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Self-paced">Self-paced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="modeOfAssessment">Mode of Assessment</Label>
          <Input
            id="modeOfAssessment"
            value={formState.modeOfAssessment}
            onChange={(e) => setFormState({ ...formState, modeOfAssessment: e.target.value })}
            placeholder="e.g., Exams, Projects, Quizzes"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Featured Image</Label>
        {formState.image && !formState.removeImage && (
          <div className="my-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              {formState.imageFile ? 'New image preview:' : 'Current image:'}
            </p>
            <div
              className="relative w-full h-40"
              style={{
                backgroundImage: `url('/placeholder.svg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Image
                src={formState.image}
                alt="Course preview"
                fill
                className="object-cover rounded-md border"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden')
                }}
              />
            </div>
            {!formState.imageFile && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="removeImage"
                checked={formState.removeImage}
                onChange={(e) => setFormState({ ...formState, removeImage: e.target.checked })}
              />
              <Label htmlFor="removeImage" className="text-sm font-medium">
                Remove this image on save
              </Label>
            </div>
            )}
          </div>
        )}
        <Input
          id="imageFile"
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, formState, setFormState)}
          className="file:text-foreground"
        />
        {formState.imageFile && (
          <p className="text-sm text-muted-foreground mt-1">
            New image selected: {formState.imageFile.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Supported formats: JPG, PNG, GIF. Max size: 5MB.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
        <Textarea
          id="description"
          value={formState.description}
          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
          rows={4}
          placeholder="Enter course description"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="modules">Modules</Label>
        <Textarea
          id="modules"
          value={formState.modules}
          onChange={(e) => setFormState({ ...formState, modules: e.target.value })}
          rows={4}
          placeholder="Enter modules, separated by full stop (.)"
        />
        <span className="text-xs text-muted-foreground">Separate each module with a full stop (.)</span>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="prerequisites">Prerequisites</Label>
        <Textarea
          id="prerequisites"
          value={formState.prerequisites}
          onChange={(e) => setFormState({ ...formState, prerequisites: e.target.value })}
          rows={4}
          placeholder="Enter prerequisites, separated by full stop (.)"
        />
        <span className="text-xs text-muted-foreground">Separate each prerequisite with a full stop (.)</span>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="careerOpportunities">Career Opportunities</Label>
        <Textarea
          id="careerOpportunities"
          value={formState.careerOpportunities}
          onChange={(e) => setFormState({ ...formState, careerOpportunities: e.target.value })}
          rows={4}
          placeholder="Enter career opportunities, separated by full stop (.)"
        />
        <span className="text-xs text-muted-foreground">Separate each opportunity with a full stop (.)</span>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            resetCreateForm()
          }
        }}>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Create Course
          </Button>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details for your new course. Click create when you're done.
              </DialogDescription>
            </DialogHeader>
            {renderFormFields(newCourseForm, setNewCourseForm)}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                resetCreateForm()
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  isLoading || isSubmitting ||
                  !newCourseForm.title.trim() ||
                  !newCourseForm.description.trim() ||
                  !newCourseForm.instructor.trim() ||
                  !newCourseForm.category.trim() ||
                  !newCourseForm.duration.trim() ||
                  !newCourseForm.country.trim()
                }
              >
                {isLoading || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <motion.div layout className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Learning Hours</TableHead>
              <TableHead>Mode of Delivery</TableHead>
              <TableHead>Mode of Assessment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={16} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={16} className="text-center py-8">
                  {searchQuery ? 'No courses found matching your search' : 'No courses found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                  className="group"
                >
                  <TableCell>
                    <div
                      className="relative w-16 h-12"
                      style={{
                        backgroundImage: `url('/placeholder.svg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                    {course.image ? (
                        <Image
                        src={course.image}
                        alt={course.title}
                          fill
                          className="object-cover rounded"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-muted rounded flex items-center justify-center ${course.image ? 'hidden' : ''}`}>
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={course.title}>
                    {course.title}
                  </TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>
                    {capitalizeFirstLetter(course.country)}
                  </TableCell>
                  <TableCell>${course.price.toFixed(2)}</TableCell>
                  <TableCell>{course.feeType}</TableCell>
                  <TableCell>{course.currency}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        course.status === 'active'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : course.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.enrollmentCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {course.createdAt ? format(new Date(course.createdAt), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    {course.updatedAt ? format(new Date(course.updatedAt), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>{course.learningHours || "—"}</TableCell>
                  <TableCell>{course.modeOfDelivery || "—"}</TableCell>
                  <TableCell>{course.modeOfAssessment || "—"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(course)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => {
                            setSelectedCourseId(course.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          resetEditForm()
        }
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Make changes to your course. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editCourseForm && renderFormFields(editCourseForm, setEditCourseForm)}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              resetEditForm()
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={
                isLoading || isSubmitting ||
                !editCourseForm?.title?.trim() ||
                !editCourseForm?.description?.trim() ||
                !editCourseForm?.instructor?.trim() ||
                !editCourseForm?.category?.trim() ||
                !editCourseForm?.duration?.trim() ||
                !editCourseForm?.country?.trim()
              }
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setSelectedCourseId(null)
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading || isSubmitting}>
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}