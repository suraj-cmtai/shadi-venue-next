"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
  fetchAboutContent,
  fetchProcessSteps,
  createAboutContent,
  updateAboutContentById,
  deleteAboutContent,
  createProcessStep,
  updateProcessStepById,
  deleteProcessStep,
  setSelectedAboutContent,
  setSelectedProcessStep,
  clearSelectedAboutContent,
  clearSelectedProcessStep,
  selectAboutContent,
  selectProcessSteps,
  selectSelectedAboutContent,
  selectSelectedProcessStep,
  selectIsLoading,
  selectError,
  AboutContent,
  ProcessStep
} from "@/lib/redux/features/aboutSlice";
import { AppDispatch } from "@/lib/redux/store";
import { uploadImageClient, replaceImageClient } from "@/lib/firebase-client";

type TabType = "aboutContent" | "processSteps";

export default function AdminAboutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const aboutContent = useSelector(selectAboutContent);
  const processSteps = useSelector(selectProcessSteps);
  const selectedAboutContent = useSelector(selectSelectedAboutContent);
  const selectedProcessStep = useSelector(selectSelectedProcessStep);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [activeTab, setActiveTab] = useState<TabType>("aboutContent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for About Content
  const [aboutForm, setAboutForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    buttonText: "",
    buttonLink: "",
    status: "active" as "active" | "inactive"
  });

  // Form states for Process Steps
  const [processForm, setProcessForm] = useState({
    icon: "",
    title: "",
    description: "",
    bgColor: "",
    titleColor: "",
    order: 1,
    status: "active" as "active" | "inactive"
  });

  // File input refs for About Content image and Process Step icon
  const aboutImageFileRef = useRef<HTMLInputElement>(null);
  const processIconFileRef = useRef<HTMLInputElement>(null);

  // Local state for upload progress
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAboutContent());
    dispatch(fetchProcessSteps());
  }, [dispatch]);

  const resetForms = () => {
    setAboutForm({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      buttonText: "",
      buttonLink: "",
      status: "active"
    });
    setProcessForm({
      icon: "",
      title: "",
      description: "",
      bgColor: "",
      titleColor: "",
      order: 1,
      status: "active"
    });
    setIsEditing(false);
    setUploadProgress(null);
    if (aboutImageFileRef.current) aboutImageFileRef.current.value = "";
    if (processIconFileRef.current) processIconFileRef.current.value = "";
    dispatch(clearSelectedAboutContent());
    dispatch(clearSelectedProcessStep());
  };

  const openModal = (type: "create" | "edit", item?: AboutContent | ProcessStep) => {
    setIsModalOpen(true);
    setUploadProgress(null);
    if (type === "edit" && item) {
      setIsEditing(true);
      if (activeTab === "aboutContent" && "subtitle" in item) {
        const aboutItem = item as AboutContent;
        setAboutForm({
          title: aboutItem.title,
          subtitle: aboutItem.subtitle,
          description: aboutItem.description,
          image: aboutItem.image,
          buttonText: aboutItem.buttonText,
          buttonLink: aboutItem.buttonLink,
          status: aboutItem.status
        });
        dispatch(setSelectedAboutContent(aboutItem));
      } else if (activeTab === "processSteps" && "icon" in item) {
        const processItem = item as ProcessStep;
        setProcessForm({
          icon: processItem.icon,
          title: processItem.title,
          description: processItem.description,
          bgColor: processItem.bgColor,
          titleColor: processItem.titleColor,
          order: processItem.order,
          status: processItem.status
        });
        dispatch(setSelectedProcessStep(processItem));
      }
    } else {
      resetForms();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForms();
  };

  const handleAboutImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    try {
      let imageUrl: string | null;
      if (isEditing && selectedAboutContent?.image) {
        imageUrl = await replaceImageClient(file, selectedAboutContent.image);
      } else {
        imageUrl = await uploadImageClient(file, (progress) => setUploadProgress(progress));
      }
      setAboutForm((prev) => ({ ...prev, image: imageUrl || "" }));
      setUploadProgress(null);
    } catch (err) {
      setUploadProgress(null);
      alert("Failed to upload image.");
    }
  };

  const handleProcessIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    try {
      let iconUrl: string | null;
      if (isEditing && selectedProcessStep?.icon) {
        iconUrl = await replaceImageClient(file, selectedProcessStep.icon);
      } else {
        iconUrl = await uploadImageClient(file, (progress) => setUploadProgress(progress));
      }
      setProcessForm((prev) => ({ ...prev, icon: iconUrl || "" }));
      setUploadProgress(null);
    } catch (err) {
      setUploadProgress(null);
      alert("Failed to upload icon.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "aboutContent") {
      if (!aboutForm.image) {
        alert("Please upload an image for About Content.");
        return;
      }
      if (isEditing && selectedAboutContent) {
        await dispatch(updateAboutContentById(aboutForm, selectedAboutContent.id));
      } else {
        await dispatch(createAboutContent(aboutForm));
      }
    } else {
      if (!processForm.icon) {
        alert("Please upload an icon for the Process Step.");
        return;
      }
      if (isEditing && selectedProcessStep) {
        await dispatch(updateProcessStepById(processForm, selectedProcessStep.id));
      } else {
        await dispatch(createProcessStep(processForm));
      }
    }

    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      if (activeTab === "aboutContent") {
        await dispatch(deleteAboutContent(id));
      } else {
        await dispatch(deleteProcessStep(id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">About Content Management</h1>
          <p className="text-gray-600">Manage your about content and process steps</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("aboutContent")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "aboutContent"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                About Content ({aboutContent.length})
              </button>
              <button
                onClick={() => setActiveTab("processSteps")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "processSteps"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Process Steps ({processSteps.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === "aboutContent" ? "About Content" : "Process Steps"}
              </h2>
              <button
                onClick={() => openModal("create")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New {activeTab === "aboutContent" ? "Content" : "Step"}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* About Content Table */}
            {activeTab === "aboutContent" && !isLoading && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtitle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aboutContent.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{item.subtitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.createdOn).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal("edit", item)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Process Steps Table */}
            {activeTab === "processSteps" && !isLoading && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processSteps.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.order}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal("edit", item)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isEditing ? "Edit" : "Add New"} {activeTab === "aboutContent" ? "About Content" : "Process Step"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "aboutContent" ? (
                  // About Content Form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={aboutForm.title}
                        onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={aboutForm.subtitle}
                        onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={aboutForm.description}
                        onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          ref={aboutImageFileRef}
                          onChange={handleAboutImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {aboutForm.image && (
                          <img
                            src={aboutForm.image}
                            alt="Preview"
                            className="h-12 w-12 object-cover rounded border"
                          />
                        )}
                      </div>
                      {uploadProgress !== null && (
                        <div className="mt-2 text-xs text-blue-600">
                          Uploading: {Math.round(uploadProgress)}%
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={aboutForm.buttonText}
                        onChange={(e) => setAboutForm({ ...aboutForm, buttonText: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                      <input
                        type="url"
                        value={aboutForm.buttonLink}
                        onChange={(e) => setAboutForm({ ...aboutForm, buttonLink: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={aboutForm.status}
                        onChange={(e) => setAboutForm({ ...aboutForm, status: e.target.value as "active" | "inactive" })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </>
                ) : (
                  // Process Step Form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          ref={processIconFileRef}
                          onChange={handleProcessIconChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {processForm.icon && (
                          <img
                            src={processForm.icon}
                            alt="Preview"
                            className="h-12 w-12 object-cover rounded border"
                          />
                        )}
                      </div>
                      {uploadProgress !== null && (
                        <div className="mt-2 text-xs text-blue-600">
                          Uploading: {Math.round(uploadProgress)}%
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={processForm.title}
                        onChange={(e) => setProcessForm({ ...processForm, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={processForm.description}
                        onChange={(e) => setProcessForm({ ...processForm, description: e.target.value })}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color (CSS class)</label>
                      <input
                        type="text"
                        value={processForm.bgColor}
                        onChange={(e) => setProcessForm({ ...processForm, bgColor: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., bg-white border border-[#212d47] text-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title Color (CSS class)</label>
                      <input
                        type="text"
                        value={processForm.titleColor}
                        onChange={(e) => setProcessForm({ ...processForm, titleColor: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., text-[#212d47]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                      <input
                        type="number"
                        value={processForm.order}
                        onChange={(e) => setProcessForm({ ...processForm, order: parseInt(e.target.value) || 1 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={processForm.status}
                        onChange={(e) => setProcessForm({ ...processForm, status: e.target.value as "active" | "inactive" })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}