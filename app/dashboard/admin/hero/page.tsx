'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchHeroSlides,
  addHero,
  updateHero,
  deleteHero,
  setSelectedHeroSlide,
  clearSelectedHeroSlide,
  selectHeroSlides,
  selectSelectedHeroSlide,
  selectIsLoading,
  selectError,
  HeroSlide
} from '@/lib/redux/features/heroSlice';
import { uploadImageClient, replaceImageClient } from '@/lib/firebase-client';
import { Trash2, Edit, Plus, X, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';

const HeroManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const heroSlides = useSelector(selectHeroSlides);
  const selectedHeroSlide = useSelector(selectSelectedHeroSlide);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    heading: '',
    subtext: '',
    cta: '',
    image: '',
    status: 'active'
  });

  // Fetch hero slides on component mount
  useEffect(() => {
    dispatch(fetchHeroSlides());
  }, [dispatch]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for adding new hero slide
  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      heading: '',
      subtext: '',
      cta: '',
      image: '',
      status: 'active'
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
    dispatch(clearSelectedHeroSlide());
  };

  // Open modal for editing hero slide
  const handleEdit = (heroSlide: HeroSlide) => {
    setIsEditing(true);
    setFormData(heroSlide);
    setImageFile(null);
    setImagePreview(heroSlide.image);
    setIsModalOpen(true);
    dispatch(setSelectedHeroSlide(heroSlide));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.heading || !formData.heading.trim()) {
      alert('Please enter a heading');
      return;
    }

    setUploading(true);
    
    try {
      let imageUrl = formData.image || '';
      
      // Handle image upload
      if (imageFile) {
        if (isEditing && selectedHeroSlide) {
          // Replace existing image
          imageUrl = await replaceImageClient(imageFile, selectedHeroSlide.image) || '';
        } else {
          // Upload new image
          imageUrl = await uploadImageClient(imageFile);
        }
      }

      const heroData = {
        ...formData,
        image: imageUrl,
        heading: formData.heading?.trim(),
        subtext: formData.subtext?.trim(),
        cta: formData.cta?.trim()
      };

      if (isEditing && selectedHeroSlide) {
        await dispatch(updateHero(heroData, selectedHeroSlide.id));
      } else {
        await dispatch(addHero(heroData as Omit<HeroSlide, 'id' | 'createdOn' | 'updatedOn'>));
      }

      setIsModalOpen(false);
      setFormData({
        heading: '',
        subtext: '',
        cta: '',
        image: '',
        status: 'active'
      });
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error saving hero slide:', error);
      alert('Failed to save hero slide. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, heading: string) => {
    if (window.confirm(`Are you sure you want to delete "${heading}"?`)) {
      await dispatch(deleteHero(id));
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      heading: '',
      subtext: '',
      cta: '',
      image: '',
      status: 'active'
    });
    setImageFile(null);
    setImagePreview('');
    dispatch(clearSelectedHeroSlide());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Slides Management</h1>
          <p className="text-gray-600 mt-1">Manage your website's hero slides</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add New Hero Slide
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !heroSlides.length && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Hero Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroSlides.map((heroSlide) => (
          <div key={heroSlide.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image */}
            <div className="h-48 bg-gray-200 relative">
              {heroSlide.image ? (
                <img
                  src={heroSlide.image}
                  alt={heroSlide.heading}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="text-gray-400" size={48} />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {heroSlide.status === 'active' ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Eye size={12} />
                    Active
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <EyeOff size={12} />
                    Inactive
                  </span>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{heroSlide.heading}</h3>
              {heroSlide.subtext && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-3">{heroSlide.subtext}</p>
              )}
              {heroSlide.cta && (
                <p className="text-blue-600 text-sm font-medium mb-3">{heroSlide.cta}</p>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(heroSlide)}
                  className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(heroSlide.id, heroSlide.heading)}
                  className="flex-1 bg-red-100 text-red-600 px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && heroSlides.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hero slides yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first hero slide</p>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Hero Slide
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Image *
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          if (!isEditing) {
                            setFormData(prev => ({ ...prev, image: '' }));
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                      <p className="text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Heading */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading *
                </label>
                <input
                  type="text"
                  name="heading"
                  value={formData.heading || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hero heading"
                  required
                />
              </div>

              {/* Subtext */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtext
                </label>
                <textarea
                  name="subtext"
                  value={formData.subtext || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hero subtext"
                />
              </div>

              {/* CTA */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call to Action
                </label>
                <input
                  type="text"
                  name="cta"
                  value={formData.cta || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter call to action text"
                />
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || 'active'}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </div>
                  ) : (
                    isEditing ? 'Update Hero Slide' : 'Add Hero Slide'
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

export default HeroManagement;