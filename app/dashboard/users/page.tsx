"use client"

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import {
  fetchUsers,
  updateUser,
  deleteUser,
  selectUsers,
  selectUserLoading,
  selectUserError,
  setSearchQuery,
} from '@/lib/redux/features/userSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'hotel' | 'vendor';
  avatar?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  bookings?: string[];
  favorites?: {
    hotels?: string[];
    vendors?: string[];
  };
  notifications: {
    id: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface UserFormState {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'hotel' | 'vendor';
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  avatar: string | null;
  avatarFile: File | null;
  removeAvatar: boolean;
}

const initialFormState: UserFormState = {
  name: "",
  email: "",
  role: "user",
  phoneNumber: "",
  street: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  avatar: null,
  avatarFile: null,
  removeAvatar: false,
};

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQueryLocal] = useState("");
  const [editUserForm, setEditUserForm] = useState<UserFormState | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Clean up object URLs when component unmounts or form changes
  useEffect(() => {
    return () => {
      if (editUserForm?.avatarFile && editUserForm.avatar?.startsWith('blob:')) {
        URL.revokeObjectURL(editUserForm.avatar);
      }
    };
  }, [editUserForm?.avatarFile]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phoneNumber && user.phoneNumber.includes(searchQuery)) ||
    (user.address?.city && user.address.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetEditForm = () => {
    if (editUserForm?.avatarFile && editUserForm.avatar?.startsWith('blob:')) {
      URL.revokeObjectURL(editUserForm.avatar);
    }
    setEditUserForm(null);
    setSelectedUserId(null);
  };

  const openEditDialog = (user: User) => {
    setSelectedUserId(user.id);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || "",
      street: user.address?.street || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      country: user.address?.country || "",
      zipCode: user.address?.zipCode || "",
      avatar: user.avatar || null,
      avatarFile: null,
      removeAvatar: false,
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editUserForm || !selectedUserId || isSubmitting) return;

    // Validation
    if (!editUserForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editUserForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", editUserForm.name);
      formData.append("email", editUserForm.email);
      formData.append("role", editUserForm.role);
      formData.append("phoneNumber", editUserForm.phoneNumber);

      // Add address fields if any are present
      if (editUserForm.street || editUserForm.city || editUserForm.state || editUserForm.country || editUserForm.zipCode) {
        formData.append("street", editUserForm.street);
        formData.append("city", editUserForm.city);
        formData.append("state", editUserForm.state);
        formData.append("country", editUserForm.country);
        formData.append("zipCode", editUserForm.zipCode);
      }

      if (editUserForm.avatarFile) {
        formData.append("avatar", editUserForm.avatarFile);
      }
      formData.append("removeAvatar", editUserForm.removeAvatar.toString());

      await dispatch(updateUser({ id: selectedUserId, data: formData })).unwrap();
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      resetEditForm();
    } catch (err: any) {
      toast.error(err.message || "Error updating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await dispatch(deleteUser(selectedUserId)).unwrap();
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (err: any) {
      toast.error(err.message || "Error deleting user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editUserForm) return;

    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous object URL
      if (editUserForm.avatarFile && editUserForm.avatar?.startsWith('blob:')) {
        URL.revokeObjectURL(editUserForm.avatar);
      }

      setEditUserForm({
        ...editUserForm,
        avatar: URL.createObjectURL(file),
        avatarFile: file,
        removeAvatar: false,
      });
    }
  };

  const handleRemoveAvatar = () => {
    if (!editUserForm) return;

    // Clean up previous object URL
    if (editUserForm.avatarFile && editUserForm.avatar?.startsWith('blob:')) {
      URL.revokeObjectURL(editUserForm.avatar);
    }

    setEditUserForm({
      ...editUserForm,
      avatar: null,
      avatarFile: null,
      removeAvatar: true,
    });
  };

  const renderUserForm = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={editUserForm?.name || ""}
          onChange={(e) =>
            setEditUserForm((prev) =>
              prev ? { ...prev, name: e.target.value } : null
            )
          }
          placeholder="User name"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={editUserForm?.email || ""}
          onChange={(e) =>
            setEditUserForm((prev) =>
              prev ? { ...prev, email: e.target.value } : null
            )
          }
          placeholder="Email address"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          value={editUserForm?.role || "user"}
          onChange={(e) =>
            setEditUserForm((prev) =>
              prev ? { ...prev, role: e.target.value as User['role'] } : null
            )
          }
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="hotel">Hotel</option>
          <option value="vendor">Vendor</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={editUserForm?.phoneNumber || ""}
          onChange={(e) =>
            setEditUserForm((prev) =>
              prev ? { ...prev, phoneNumber: e.target.value } : null
            )
          }
          placeholder="Phone number"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={editUserForm?.street || ""}
          onChange={(e) =>
            setEditUserForm((prev) =>
              prev ? { ...prev, street: e.target.value } : null
            )
          }
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={editUserForm?.city || ""}
            onChange={(e) =>
              setEditUserForm((prev) =>
                prev ? { ...prev, city: e.target.value } : null
              )
            }
            placeholder="City"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={editUserForm?.state || ""}
            onChange={(e) =>
              setEditUserForm((prev) =>
                prev ? { ...prev, state: e.target.value } : null
              )
            }
            placeholder="State"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={editUserForm?.country || ""}
            onChange={(e) =>
              setEditUserForm((prev) =>
                prev ? { ...prev, country: e.target.value } : null
              )
            }
            placeholder="Country"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={editUserForm?.zipCode || ""}
            onChange={(e) =>
              setEditUserForm((prev) =>
                prev ? { ...prev, zipCode: e.target.value } : null
              )
            }
            placeholder="ZIP Code"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="avatar">Avatar</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
        {editUserForm?.avatar && (
          <div className="mt-2">
            <img
              src={editUserForm.avatar}
              alt="Avatar preview"
              className="w-20 h-20 object-cover rounded-full"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveAvatar}
              className="mt-2"
            >
              Remove Avatar
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQueryLocal(e.target.value);
              dispatch(setSearchQuery(e.target.value));
            }}
            className="w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Role:</strong> {user.role}</p>
                  {user.phoneNumber && (
                    <p><strong>Phone:</strong> {user.phoneNumber}</p>
                  )}
                  {user.address && (
                    <p><strong>Location:</strong> {user.address.city}, {user.address.country}</p>
                  )}
                  <p><strong>Notifications:</strong> {user.notifications.filter(n => !n.read).length} unread</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => openEditDialog(user)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                      <DialogDescription>
                        Make changes to the user profile here.
                      </DialogDescription>
                    </DialogHeader>
                    {renderUserForm()}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleEdit} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        user's account and remove their data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
                        {isSubmitting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
