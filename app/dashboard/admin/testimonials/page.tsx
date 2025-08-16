'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchTestimonials,
  addTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  updateTestimonialOrderAction,
  setSelectedTestimonial,
  clearSelectedTestimonial,
  selectTestimonials,
  selectSelectedTestimonial,
  selectIsLoading,
  selectError,
  Testimonial
} from '@/lib/redux/features/testimonialSlice';
import { uploadImageClient, replaceImageClient, uploadImageWithProgress } from '@/lib/firebase-client';
import { 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  Quote,
  ExternalLink,
  GripVertical,
  Save,
  AlertCircle
} from 'lucide-react';

interface FormData {
  name: string;
  text: string;
  images: string[];
  storyUrl: string;
  status: 'active' | 'inactive';
  order: number;
}

const TestimonialManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const testimonials = useSelector(selectTestimonials);
  const selectedTestimonial = useSelector(selectSelectedTestimonial);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    text: '',
    images: [],
    storyUrl: '',
    status: 'active',
    order: 0
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    dispatch(fetchTestimonials());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTestimonial) {
      setFormData({
        name: selectedTestimonial.name,
        text: selectedTestimonial.text,
        images: selectedTestimonial.images,
        storyUrl: selectedTestimonial.storyUrl,
        status: selectedTestimonial.status,
        order: selectedTestimonial.order
      });
      setIsEditing(true);
      setIsModalOpen(true);
    }
  }, [selectedTestimonial]);

  const resetForm = () => {
    setFormData({
      name: '',
      text: '',
      images: [],
      storyUrl: '',
      status: 'active',
      order: testimonials.length
    });
    setImageFiles([]);
    setIsEditing(false);
    dispatch(clearSelectedTestimonial());
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number, isUploaded: boolean) => {
    if (isUploaded) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      const uploadedCount = formData.images.length;
      const fileIndex = index - uploadedCount;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileKey = `file_${i}`;
        
        // Use uploadImageWithProgress for better UX
        const url = await uploadImageWithProgress(
          file,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileKey]: progress
            }));
          }
        );
        
        uploadedUrls.push(url);
        
        // Clear progress for this file
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileKey];
          return updated;
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadProgress({}); // Clear all progress on error
      throw error;
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newImageUrls = await uploadImages();
      const finalImages = [...formData.images, ...newImageUrls];
      
      const submitData = {
        ...formData,
        images: finalImages
      };

      if (isEditing && selectedTestimonial) {
        dispatch(updateTestimonialAction(submitData, selectedTestimonial.id));
      } else {
        dispatch(addTestimonialAction(submitData));
      }
      
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    dispatch(setSelectedTestimonial(testimonial));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      dispatch(deleteTestimonialAction(id));
    }
  };

  const handleStatusToggle = (testimonial: Testimonial) => {
    const newStatus = testimonial.status === 'active' ? 'inactive' : 'active';
    dispatch(updateTestimonialAction({ status: newStatus }, testimonial.id));
  };

  const moveTestimonial = (id: string, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(t => t.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= testimonials.length) return;

    const newOrder = testimonials[newIndex].order;
    dispatch(updateTestimonialOrderAction(id, newOrder));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const targetIndex = testimonials.findIndex(t => t.id === targetId);
    if (targetIndex === -1) return;

    const newOrder = testimonials[targetIndex].order;
    dispatch(updateTestimonialOrderAction(draggedItem, newOrder));
    setDraggedItem(null);
  };

  const sortedTestimonials = [...testimonials].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Testimonial Management</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTestimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            draggable
            onDragStart={(e) => handleDragStart(e, testimonial.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, testimonial.id)}
            className={`bg-white rounded-lg shadow-md p-6 border ${
              testimonial.status === 'active' ? 'border-green-200' : 'border-gray-200'
            } cursor-move hover:shadow-lg transition-shadow`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Order: {testimonial.order}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => moveTestimonial(testimonial.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveTestimonial(testimonial.id, 'down')}
                  disabled={index === sortedTestimonials.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-4">
              {testimonial.images.length > 0 ? (
                <img
                  src={testimonial.images[0]}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{testimonial.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      testimonial.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {testimonial.status === 'active' ? (
                      <Eye size={12} className="mr-1" />
                    ) : (
                      <EyeOff size={12} className="mr-1" />
                    )}
                    {testimonial.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-start gap-2 mb-2">
                <Quote size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-gray-600 text-sm line-clamp-3">{testimonial.text}</p>
              </div>
              {testimonial.storyUrl && (
                <a
                  href={testimonial.storyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink size={12} />
                  View Story
                </a>
              )}
            </div>

            {testimonial.images.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {testimonial.images.slice(1).map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={image}
                    alt={`${testimonial.name} ${imgIndex + 2}`}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleStatusToggle(testimonial)}
                  className={`p-2 rounded transition-colors ${
                    testimonial.status === 'active'
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {testimonial.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(testimonial.createdOn).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story URL
                  </label>
                  <input
                    type="url"
                    name="storyUrl"
                    value={formData.storyUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testimonial Text *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                
                {/* Existing Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Image Files with Progress */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {imageFiles.map((file, index) => {
                      const fileKey = `file_${index}`;
                      const progress = uploadProgress[fileKey];
                      
                      return (
                        <div key={index} className="relative">
                          <div className="w-full h-24 bg-gray-100 rounded border flex flex-col items-center justify-center p-2">
                            <ImageIcon size={16} className="text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 text-center truncate w-full">
                              {file.name}
                            </span>
                            {progress !== undefined && (
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(formData.images.length + index, false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload images or drag and drop
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                  >
                    Browse Files
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || Object.keys(uploadProgress).length > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {(isLoading || Object.keys(uploadProgress).length > 0) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <Save size={16} />
                  {isEditing ? 'Update' : 'Create'} Testimonial
                  {Object.keys(uploadProgress).length > 0 && (
                    <span className="text-xs">
                      ({Object.keys(uploadProgress).length} uploading...)
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;