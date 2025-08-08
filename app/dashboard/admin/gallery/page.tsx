"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, Search, Image as ImageIcon, ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { fetchGallery, selectGallery, selectError, selectIsLoading, GalleryItem, deleteGallery, addGallery, updateGallery } from "@/lib/redux/features/gallerySlice";
import { AppDispatch } from "@/lib/redux/store";

export default function GalleryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const galleryImages = useSelector(selectGallery);
  const error = useSelector(selectError);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const [search, setSearch] = useState("");
  const [localLoading, setLocalLoading] = useState(false); // Renamed from 'loading' to avoid confusion
  const [modalOpen, setModalOpen] = useState(false);

  // Fixed FormState type definition
  type FormState = {
    title: string;
    image: string;
    category: string;
    description: string;
    status: 'active' | 'inactive';
    id?: string;
    createdOn?: string;
    updatedOn?: string;
  };

  const [editImage, setEditImage] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<FormState>({ 
    title: "", 
    image: "", 
    category: "",
    description: "",
    status: "active"
  });
  const [deleteImage, setDeleteImage] = useState<GalleryItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter function
  const filterGalleryItems = (items: GalleryItem[], searchTerm: string) => {
    if (!searchTerm.trim()) return items;
    
    return items.filter((img) =>
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.category && img.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (img.description && img.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Filtered images
  const filteredImages = useMemo(() => {
    return filterGalleryItems(Array.isArray(galleryImages) ? galleryImages : [], search);
  }, [galleryImages, search]);

  // Handlers
  const openAddModal = () => {
    setEditImage(null);
    setForm({ 
      title: "", 
      image: "", 
      category: "",
      description: "",
      status: "active"
    });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (img: GalleryItem) => {
  setEditImage(img);
  setForm({ 
    title: img.title, 
    image: img.image,  // Make sure this is set
    category: img.category || "",
    description: img.description || "",
    status: img.status || "active"
  });
  setImageFile(null);
  // Use existing image URL for preview
  setImagePreview(img.image || null);
  setModalOpen(true);
};

  const handleDelete = async () => {
    if (!deleteImage) return;
  
    setLocalLoading(true);
    try {
      await dispatch(deleteGallery(deleteImage.id))
      toast.success("Image deleted successfully!");
      setDeleteImage(null);
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      setImageFile(file);
      
      // Clean up previous blob URL if it exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    // For new images, require image file
    if (!editImage && !imageFile) {
      toast.error("Image is required for new gallery item");
      return;
    }
    
    setLocalLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("category", form.category.trim());
      formData.append("description", form.description.trim());
      formData.append("status", form.status);
      
      // Only append image if a new file is selected
      if (imageFile) {
        formData.append("image", imageFile);
      }
      else if (editImage && editImage.image) {
        formData.append("image", editImage.image);
      }

      if (editImage) {
        // Pass the editImage.id to the updateGallery action
        await dispatch(updateGallery( formData, editImage.id ));
        toast.success("Image updated successfully!");
      } else {
        await dispatch(addGallery(formData));
        toast.success("Image added successfully!");
      }
      
      // Reset form and close modal
      setModalOpen(false);
      setForm({ 
        title: "", 
        image: "", 
        category: "",
        description: "",
        status: "active"
      });
      setImageFile(null);
      setImagePreview(null);
      setEditImage(null);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      const errorMessage = editImage ? "Failed to update image" : "Failed to add image";
      toast.error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  // Cleanup image preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Reset lightbox index when filtered images change
  useEffect(() => {
    if (lightboxIndex >= filteredImages.length && filteredImages.length > 0) {
      setLightboxIndex(0);
    }
  }, [filteredImages.length, lightboxIndex]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <motion.div
        layout
        className="relative rounded-xl bg-gradient-to-r from-black/10 to-transparent p-6 border shadow-sm"
      >
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-1">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-main)" }}
            >
              Gallery Management
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Input
                  placeholder="Search images..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 h-10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                />
              </motion.div>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={openAddModal}
                size="lg"
                className="gap-2 bg-black/90 hover:bg-black text-white shadow-sm transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" /> Add Image
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Gallery Grid with Loading State */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {isLoading && galleryImages.length === 0 ? (
            // Loading skeleton - only show when there are no images
            [...Array(8)].map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-100 rounded-xl overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                    <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : filteredImages.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center justify-center py-16 px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No images found
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {search
                  ? "Try adjusting your search query"
                  : "Add some images to get started"}
              </p>
            </motion.div>
          ) : (
            // Image grid with staggered animations
            filteredImages.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.05,
                }}
                className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Image container with hover effects */}
                <motion.div
                  className="relative aspect-[4/3] bg-gray-50 cursor-pointer"
                  style={{
                    backgroundImage: `url('/placeholder.svg')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => {
                    setLightboxOpen(true);
                    setLightboxIndex(index);
                  }}
                >
                  {img.image ? (
                    <>
                      <Image
                        src={img.image}
                        alt={img.title}
                        fill
                        className="object-cover transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        img.status === "active" ? "default" : "secondary"
                      }
                      className={cn(
                        "text-xs",
                        img.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {img.status}
                    </Badge>
                  </div>
                </motion.div>

                {/* Card content */}
                <motion.div
                  className="p-4"
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <h3
                    className="font-semibold text-lg mb-1 truncate"
                    title={img.title}
                  >
                    {img.title}
                  </h3>

                  {img.category && (
                    <p
                      className="text-sm text-gray-500 mb-3 truncate"
                      title={img.category}
                    >
                      {img.category}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(img)}
                      className="flex-1 hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteImage(img)}
                      disabled={isLoading || localLoading}
                      className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6 w-full max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editImage ? "Edit Image" : "Add New Image"}
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Enter image title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="Enter category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="min-h-[100px] w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Badge
                  variant={form.status === "active" ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer select-none",
                    form.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  )}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      status: f.status === "active" ? "inactive" : "active",
                    }))
                  }
                >
                  {form.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Image {!editImage && "*"}
                  {editImage && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Leave empty to keep current image)
                    </span>
                  )}
                </label>
                <AnimatePresence mode="wait">
                  {(imagePreview || (editImage && editImage.image)) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative rounded-lg overflow-hidden group h-48"
                      style={{
                        backgroundImage: `url('/placeholder.svg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <Image
                        src={imagePreview || editImage?.image || ""}
                        alt="Preview"
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black/10 file:text-black hover:file:bg-black/20 focus:outline-none focus:ring-2 focus:ring-black/20 rounded-lg"
                />
                {editImage && !imageFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current image: {editImage.image.split("/").pop()?.slice(0, 10)}...
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Max file size: 5MB. Accepted formats: JPG, PNG, GIF, WebP
                </p>
              </div>
            </motion.div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={localLoading || isLoading}
                className="bg-black/90 hover:bg-black text-white gap-2"
              >
                {(localLoading || isLoading) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editImage ? "Update Image" : "Add Image"}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={localLoading || isLoading}
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </motion.form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteImage}
        onOpenChange={(open) => !open && setDeleteImage(null)}
      >
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="space-y-6"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">Delete Image</DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="py-4 text-center"
            >
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-black">
                  {deleteImage?.title}
                </span>
                ?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </motion.div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={localLoading || isLoading}
                className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700"
              >
                {localLoading || isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Image
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={localLoading || isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95" showCloseButton={false}>
          <DialogHeader className="hidden text-white">
            <DialogTitle className="text-2xl font-bold">
              {filteredImages[lightboxIndex]?.title || "Image Viewer"}
            </DialogTitle>
            {filteredImages[lightboxIndex]?.category && (
              <p className="text-sm text-gray-300 mt-1">
                {filteredImages[lightboxIndex].category}
              </p>
            )}
          </DialogHeader>
          <div className="relative h-[90vh]">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Main image */}
            {filteredImages[lightboxIndex] && (
              <div
                className="relative h-full w-full flex items-center justify-center"
                style={{
                  backgroundImage: `url('/placeholder.svg')`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              >
                <Image
                  src={filteredImages[lightboxIndex].image}
                  alt={filteredImages[lightboxIndex].title}
                  fill
                  className="object-contain"
                  priority
                  sizes="90vw"
                />
                <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                  <h3 className="text-xl font-medium">
                    {filteredImages[lightboxIndex].title}
                  </h3>
                  {filteredImages[lightboxIndex].category && (
                    <p className="text-sm text-gray-300 mt-1">
                      {filteredImages[lightboxIndex].category}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {lightboxIndex + 1} of {filteredImages.length}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons - only show if more than 1 image */}
            {filteredImages.length > 1 && (
              <>
                <div className="absolute top-1/2 -translate-y-1/2 left-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        i > 0 ? i - 1 : filteredImages.length - 1
                      )
                    }
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        i < filteredImages.length - 1 ? i + 1 : 0
                      )
                    }
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}