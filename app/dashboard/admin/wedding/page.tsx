'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
    fetchWeddings,
    addWedding,
    updateWedding,
    deleteWedding,
    selectWeddings,
    selectIsLoading,
    selectError,
    WeddingItem
} from '@/lib/redux/features/weddingSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';

export default function WeddingManagement() {
    const dispatch = useDispatch<AppDispatch>();
    const weddings = useSelector(selectWeddings);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedWedding, setSelectedWedding] = useState<WeddingItem | null>(null);
    const [formData, setFormData] = useState({
        coupleNames: '',
        location: '',
        photoCount: 0,
        weddingDate: '',
        theme: '',
        description: '',
        status: 'active' as 'active' | 'inactive',
        mainImage: null as File | null,
        thumbnail1: null as File | null,
        thumbnail2: null as File | null,
        galleryImages: [] as File[]
    });

    useEffect(() => {
        dispatch(fetchWeddings());
    }, [dispatch]);

    const handleInputChange = (field: string, value: string | number | File | File[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (field: string, files: FileList | null) => {
        if (files) {
            if (field === 'galleryImages') {
                const fileArray = Array.from(files);
                setFormData(prev => ({
                    ...prev,
                    [field]: fileArray
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [field]: files[0]
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();

        formDataToSend.append('coupleNames', formData.coupleNames);
        formDataToSend.append('location', formData.location);
        formDataToSend.append('photoCount', formData.photoCount.toString());
        formDataToSend.append('weddingDate', formData.weddingDate);
        formDataToSend.append('theme', formData.theme);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('status', formData.status);

        if (formData.mainImage) {
            formDataToSend.append('mainImage', formData.mainImage);
        }
        if (formData.thumbnail1) {
            formDataToSend.append('thumbnail1', formData.thumbnail1);
        }
        if (formData.thumbnail2) {
            formDataToSend.append('thumbnail2', formData.thumbnail2);
        }

        formData.galleryImages.forEach(image => {
            formDataToSend.append('galleryImages', image);
        });

        if (selectedWedding) {
            await dispatch(updateWedding(formDataToSend, selectedWedding.id));
            setIsEditDialogOpen(false);
        } else {
            await dispatch(addWedding(formDataToSend));
            setIsAddDialogOpen(false);
        }

        resetForm();
    };

    const handleEdit = (wedding: WeddingItem) => {
        setSelectedWedding(wedding);
        setFormData({
            coupleNames: wedding.coupleNames,
            location: wedding.location,
            photoCount: wedding.photoCount,
            weddingDate: wedding.weddingDate,
            theme: wedding.theme,
            description: wedding.description,
            status: wedding.status,
            mainImage: null,
            thumbnail1: null,
            thumbnail2: null,
            galleryImages: []
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        await dispatch(deleteWedding(id));
    };

    const resetForm = () => {
        setFormData({
            coupleNames: '',
            location: '',
            photoCount: 0,
            weddingDate: '',
            theme: '',
            description: '',
            status: 'active',
            mainImage: null,
            thumbnail1: null,
            thumbnail2: null,
            galleryImages: []
        });
        setSelectedWedding(null);
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Couple Names</label>
                    <Input
                        value={formData.coupleNames}
                        onChange={(e) => handleInputChange('coupleNames', e.target.value)}
                        placeholder="e.g., Richa and Shreyas"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Delhi NCR"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Photo Count</label>
                    <Input
                        type="number"
                        value={formData.photoCount}
                        onChange={(e) => handleInputChange('photoCount', parseInt(e.target.value))}
                        placeholder="30"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Wedding Date</label>
                    <Input
                        type="date"
                        value={formData.weddingDate}
                        onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <Input
                        value={formData.theme}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        placeholder="e.g., Traditional, Modern"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}>
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

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Wedding description..."
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Main Image</label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('mainImage', e.target.files)}
                        required={!selectedWedding}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail 1</label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('thumbnail1', e.target.files)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail 2</label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('thumbnail2', e.target.files)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Gallery Images</label>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange('galleryImages', e.target.files)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                    resetForm();
                }}>
                    Cancel
                </Button>
                <Button type="submit">
                    {selectedWedding ? 'Update Wedding' : 'Add Wedding'}
                </Button>
            </div>
        </form>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Wedding Management</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetForm()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Wedding
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Wedding</DialogTitle>
                        </DialogHeader>
                        {renderForm()}
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {weddings.map((wedding: WeddingItem) => (
                        <Card key={wedding.id} className="overflow-hidden">
                            <div className="relative h-48">
                                <Image
                                    src={wedding.images?.main || '/images/wedding/wed3.jpg'}
                                    alt={wedding.coupleNames}
                                    fill
                                    className="object-cover"
                                />
                                <Badge
                                    variant={wedding.status === 'active' ? 'default' : 'secondary'}
                                    className="absolute top-2 right-2"
                                >
                                    {wedding.status}
                                </Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-lg">{wedding.coupleNames}</CardTitle>
                                <p className="text-sm text-gray-600">{wedding.location}</p>
                                <p className="text-sm text-gray-600">
                                    {(() => {
                                        try {
                                            const date = new Date(wedding.weddingDate);
                                            return isNaN(date.getTime()) ? "Date not available" : date.toLocaleDateString();
                                        } catch (error) {
                                            return "Date not available";
                                        }
                                    })()}
                                </p>
                                <p className="text-sm text-gray-600">{wedding.photoCount} photos</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(wedding)}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Edit Wedding</DialogTitle>
                                            </DialogHeader>
                                            {renderForm()}
                                        </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the wedding.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(wedding.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}