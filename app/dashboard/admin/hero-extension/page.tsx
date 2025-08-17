'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchImages,
  fetchContent,
  addImageAction,
  updateImageAction,
  deleteImageAction,
  updateContentAction,
  setSelectedImage,
  clearSelectedImage,
  selectImages,
  selectContent,
  selectSelectedImage,
  selectIsLoading,
  selectError,
  HeroExtensionImage,
  HeroExtensionContent,
  ImageType
} from '@/lib/redux/features/heroExtensionSlice';
import { uploadImageWithProgress } from '@/lib/firebase-client';
import { 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  EyeOff,
  Save,
  AlertCircle,
  Grid,
  FileText,
  Filter
} from 'lucide-react';

interface ImageFormData {
  type: ImageType;
  imageUrl: string;
  altText: string;
  order: number;
  status: 'active' | 'inactive';
}

interface ContentFormData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
}

const IMAGE_TYPE_LABELS: { [key in ImageType]: string } = {
  tall_left: 'Tall Left',
  main_center: 'Main Center',
  bottom_left: 'Bottom Left',
  center_bottom: 'Center Bottom',
  top_right: 'Top Right',
  far_right: 'Far Right'
};

const HeroExtensionManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const images = useSelector(selectImages);
  const content = useSelector(selectContent);
  const selectedImage = useSelector(selectSelectedImage);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [activeTab, setActiveTab] = useState<'images' | 'content'>('images');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterType, setFilterType] = useState<ImageType | 'all'>('all');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imageFormData, setImageFormData] = useState<ImageFormData>({
    type: 'tall_left',
    imageUrl: '',
    altText: '',
    order: 0,
    status: 'active'
  });

  const [contentFormData, setContentFormData] = useState<ContentFormData>({
    title: '',
    subtitle: '',
    buttonText: 'Contact Us',
    buttonLink: '/contact',
    status: 'active'
  });

  useEffect(() => {
    dispatch(fetchImages());
    dispatch(fetchContent());
  }, [dispatch]);

  useEffect(() => {
    if (content) {
      setContentFormData({
        title: content.title,
        subtitle: content.subtitle,
        buttonText: content.buttonText,
        buttonLink: content.buttonLink,
        status: content.status
      });
    }
  }, [content]);

  useEffect(() => {
    if (selectedImage) {
      setImageFormData({
        type: selectedImage.type,
        imageUrl: selectedImage.imageUrl,
        altText: selectedImage.altText,
        order: selectedImage.order,
        status: selectedImage.status
      });
      setIsEditing(true);
      setIsImageModalOpen(true);
    }
  }, [selectedImage]);

  const resetImageForm = () => {
    setImageFormData({
      type: 'tall_left',
      imageUrl: '',
      altText: '',
      order: filteredImages.length,
      status: 'active'
    });
    setImageFile(null);
    setUploadProgress({});
    setIsEditing(false);
    dispatch(clearSelectedImage());
  };

  const resetContentForm = () => {
    setContentFormData({
      title: '',
      subtitle: '',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      status: 'active'
    });
  };

  const openImageModal = () => {
    resetImageForm();
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    resetImageForm();
  };

  const openContentModal = () => {
    setIsContentModalOpen(true);
  };

  const closeContentModal = () => {
    setIsContentModalOpen(false);
    resetContentForm();
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setImageFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  const handleContentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    const fileKey = 'hero_extension_upload';
    
    try {
      const url = await uploadImageWithProgress(
        imageFile,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileKey]: progress
          }));
        }
      );
      
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[fileKey];
        return updated;
      });
      
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[fileKey];
        return updated;
      });
      throw error;
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let finalImageUrl = imageFormData.imageUrl;
      
      if (imageFile) {
        finalImageUrl = await uploadImage() || '';
      }
      
      if (!finalImageUrl) {
        alert('Please provide an image URL or upload an image');
        return;
      }
      
      const submitData = {
        ...imageFormData,
        imageUrl: finalImageUrl
      };

      if (isEditing && selectedImage) {
        dispatch(updateImageAction(submitData, selectedImage.id));
      } else {
        dispatch(addImageAction(submitData));
      }
      
      closeImageModal();
    } catch (error) {
      console.error('Error submitting image form:', error);
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (content) {
        dispatch(updateContentAction(contentFormData, content.id));
      } else {
        dispatch(updateContentAction(contentFormData));
      }
      
      closeContentModal();
    } catch (error) {
      console.error('Error submitting content form:', error);
    }
  };

  const handleEditImage = (image: HeroExtensionImage) => {
    dispatch(setSelectedImage(image));
  };

  const handleDeleteImage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      dispatch(deleteImageAction(id));
    }
  };

  const handleStatusToggle = (image: HeroExtensionImage) => {
    const newStatus = image.status === 'active' ? 'inactive' : 'active';
    dispatch(updateImageAction({ status: newStatus }, image.id));
  };

  const filteredImages = filterType === 'all' 
    ? images 
    : images.filter(img => img.type === filterType);

  const groupedImages = filteredImages.reduce((acc, image) => {
    if (!acc[image.type]) acc[image.type] = [];
    acc[image.type].push(image);
    return acc;
  }, {} as { [key in ImageType]: HeroExtensionImage[] });

  // Sort images within each type by order
  Object.keys(groupedImages).forEach(type => {
    groupedImages[type as ImageType].sort((a, b) => a.order - b.order);
  });

  const hasUploadInProgress = Object.keys(uploadProgress).length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hero Extension Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'images' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Grid size={20} />
            Images
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'content' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FileText size={20} />
            Content
          </button>
        </div>
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

      {/* Images Tab */}
      {activeTab === 'images' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ImageType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {Object.entries(IMAGE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={openImageModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Image
            </button>
          </div>

          {/* Images Grid */}
          <div className="space-y-8">
            {Object.entries(IMAGE_TYPE_LABELS).map(([type, label]) => {
              const typeImages = groupedImages[type as ImageType] || [];
              if (filterType !== 'all' && filterType !== type) return null;
              
              return (
                <div key={type} className="border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{label}</h3>
                    <span className="text-sm text-gray-500">
                      {typeImages.length} image{typeImages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {typeImages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No images for this type yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {typeImages.map((image) => (
                        <div
                          key={image.id}
                          className={`bg-white rounded-lg shadow-md p-4 border ${
                            image.status === 'active' ? 'border-green-200' : 'border-gray-200'
                          }`}
                        >
                          <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                            <img
                              src={image.imageUrl}
                              alt={image.altText}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 line-clamp-2">{image.altText}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Order: {image.order}</span>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  image.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {image.status === 'active' ? (
                                  <Eye size={10} className="mr-1" />
                                ) : (
                                  <EyeOff size={10} className="mr-1" />
                                )}
                                {image.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditImage(image)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleStatusToggle(image)}
                                className={`p-2 rounded transition-colors ${
                                  image.status === 'active'
                                    ? 'text-orange-600 hover:bg-orange-50'
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {image.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(image.createdOn).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Section Content</h2>
              <button
                onClick={openContentModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                Edit Content
              </button>
            </div>

            {content ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <p className="text-gray-900">{content.subtitle}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-2xl font-bold text-gray-900">{content.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <p className="text-gray-900">{content.buttonText}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <p className="text-blue-600">{content.buttonLink}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      content.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {content.status === 'active' ? (
                      <Eye size={12} className="mr-2" />
                    ) : (
                      <EyeOff size={12} className="mr-2" />
                    )}
                    {content.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No content configured yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Image' : 'Add New Image'}
              </h2>
              <button
                onClick={closeImageModal}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImageSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Type *
                  </label>
                  <select
                    name="type"
                    value={imageFormData.type}
                    onChange={handleImageInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(IMAGE_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={imageFormData.status}
                    onChange={handleImageInputChange}
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
                    value={imageFormData.order}
                    onChange={handleImageInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (optional if uploading)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={imageFormData.imageUrl}
                    onChange={handleImageInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text *
                </label>
                <input
                  type="text"
                  name="altText"
                  value={imageFormData.altText}
                  onChange={handleImageInputChange}
                  required
                  placeholder="Describe the image for accessibility"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image
                </label>
                
                {/* Current Image Preview */}
                {imageFormData.imageUrl && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                    <img
                      src={imageFormData.imageUrl}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}

                {/* New Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a new image (will replace current image)
                  </p>
                  <input
                    type="file"
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
                  
                  {/* Upload Progress */}
                  {hasUploadInProgress && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress['hero_extension_upload'] || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Uploading... {Math.round(uploadProgress['hero_extension_upload'] || 0)}%
                      </p>
                    </div>
                  )}

                  {/* Selected File Preview */}
                  {imageFile && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Selected: {imageFile.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || hasUploadInProgress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {(isLoading || hasUploadInProgress) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <Save size={16} />
                  {isEditing ? 'Update' : 'Create'} Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Section Content
              </h2>
              <button
                onClick={closeContentModal}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContentSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle *
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={contentFormData.subtitle}
                    onChange={handleContentInputChange}
                    required
                    placeholder="e.g., HELLO,"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Title *
                  </label>
                  <textarea
                    name="title"
                    value={contentFormData.title}
                    onChange={handleContentInputChange}
                    required
                    rows={3}
                    placeholder="e.g., Effortless Planning for Your Dream Wedding"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={contentFormData.buttonText}
                      onChange={handleContentInputChange}
                      placeholder="e.g., Contact Us"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      name="buttonLink"
                      value={contentFormData.buttonLink}
                      onChange={handleContentInputChange}
                      placeholder="e.g., /contact"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={contentFormData.status}
                    onChange={handleContentInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeContentModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <Save size={16} />
                  Save Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroExtensionManagement;