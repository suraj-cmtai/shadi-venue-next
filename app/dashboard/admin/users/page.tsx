"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { uploadImageClient, replaceImageClient } from "@/lib/firebase-client";
import { AppDispatch } from "@/lib/redux/store";
import {
  selectUsers,
  selectUserLoading,
  selectUserError,
  fetchUsers,
  updateUser,
  deleteUser,
  setSearchQuery,
  updateInvite,
  toggleInviteStatus,
  updateInviteTheme,
} from "@/lib/redux/features/userSlice";
import {
  selectRSVPResponses,
  selectRSVPLoading,
  selectRSVPError,
  fetchRSVPResponses,
  updateRSVPStatus,
  clearResponses,
} from "@/lib/redux/features/rsvpSlice";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// --- Types ---
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
  notifications: {
    id: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
  invite?: {
    isEnabled: boolean;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      titleColor: string;
      nameColor: string;
      backgroundColor: string;
      textColor: string;
    };
    about: {
      title: string;
      subtitle: string;
      groom: {
        name: string;
        description: string;
        image: string;
        socials: {
          instagram?: string;
          facebook?: string;
          twitter?: string;
        };
      };
      bride: {
        name: string;
        description: string;
        image: string;
        socials: {
          instagram?: string;
          facebook?: string;
          twitter?: string;
        };
      };
      coupleImage: string;
    };
    weddingEvents: {
      title: string;
      date: string;
      time: string;
      venue: string;
      description: string;
      image?: string;
    }[];
    loveStory: {
      date: string;
      title: string;
      description: string;
      image?: string;
    }[];
    planning: {
      title: string;
      description: string;
      icon?: string;
      completed: boolean;
    }[];
    invitation: {
      heading: string;
      subheading: string;
      message: string;
      rsvpLink?: string;
      backgroundImage?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

type UserRole = User['role'];
type WeddingEvent = NonNullable<User['invite']>['weddingEvents'][0];
type Theme = NonNullable<User['invite']>['theme'];

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
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

interface InviteFormState {
  isEnabled: boolean;
  theme: Theme;
  about: NonNullable<User['invite']>['about'];
  invitation: NonNullable<User['invite']>['invitation'];
  weddingEvents: WeddingEvent[];
  loveStory: NonNullable<User['invite']>['loveStory'];
  planning: NonNullable<User['invite']>['planning'];
}

// --- Initial States ---
const initialUserFormState: UserFormState = {
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

const initialInviteFormState: InviteFormState = {
  isEnabled: false,
  theme: {
    primaryColor: '#1E3A8A',
    secondaryColor: '#A4E5F6',
    titleColor: '#1E3A8A',
    nameColor: '#1E3A8A',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  about: {
    title: 'About Us',
    subtitle: 'Couple',
    groom: {
      name: '',
      description: '',
      image: '',
      socials: {
        instagram: '',
        facebook: '',
      },
    },
    bride: {
      name: '',
      description: '',
      image: '',
      socials: {
        instagram: '',
        facebook: '',
      },
    },
    coupleImage: '',
  },
  invitation: {
    heading: 'You are invited',
    subheading: 'To our wedding',
    message: 'Join us for our special day',
  },
  weddingEvents: [],
  loveStory: [],
  planning: [],
};

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  // RSVP state
  const rsvpResponses = useSelector(selectRSVPResponses);
  const rsvpLoading = useSelector(selectRSVPLoading);
  const rsvpError = useSelector(selectRSVPError);

  // Component state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQueryLocal] = useState("");
  const [activeTab, setActiveTab] = useState("user");

  // Form states
  const [userForm, setUserForm] = useState<UserFormState>(initialUserFormState);
  const [inviteForm, setInviteForm] = useState<InviteFormState>(initialInviteFormState);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Loading states for different forms
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);
  const [isRSVPSubmitting, setIsRSVPSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (userForm.avatarFile && userForm.avatar?.startsWith("blob:")) {
        URL.revokeObjectURL(userForm.avatar);
      }
    };
  }, [userForm.avatarFile]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phoneNumber && user.phoneNumber.includes(searchQuery)) ||
    (user.address?.city && user.address.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetForms = () => {
    if (userForm.avatarFile && userForm.avatar?.startsWith("blob:")) {
      URL.revokeObjectURL(userForm.avatar);
    }
    setUserForm(initialUserFormState);
    setInviteForm(initialInviteFormState);
    setSelectedUserId(null);
    setSelectedUser(null);
    dispatch(clearResponses());
  };

  const openEditDialog = (user: User) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);

    // Set user form
    setUserForm({
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

    // Set invite form if user has invite
    if (user.invite) {
      setInviteForm({
        isEnabled: user.invite.isEnabled,
        theme: user.invite.theme,
        about: user.invite.about,
        invitation: user.invite.invitation,
        weddingEvents: user.invite.weddingEvents || [],
        loveStory: user.invite.loveStory || [],
        planning: user.invite.planning || [],
      });
    } else {
      setInviteForm(initialInviteFormState);
    }

    // Fetch RSVP responses if user has invite
    if (user.invite?.isEnabled) {
      dispatch(fetchRSVPResponses(user.id));
    }

    setIsEditDialogOpen(true);
  };

  // Handle User Form Submit
  const handleUserSubmit = async () => {
    if (!selectedUserId || isUserSubmitting) return;

    if (!userForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!userForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsUserSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", userForm.name);
      formData.append("email", userForm.email);
      formData.append("role", userForm.role);
      formData.append("phoneNumber", userForm.phoneNumber);

      // Add address fields
      if (
        userForm.street ||
        userForm.city ||
        userForm.state ||
        userForm.country ||
        userForm.zipCode
      ) {
        formData.append("street", userForm.street);
        formData.append("city", userForm.city);
        formData.append("state", userForm.state);
        formData.append("country", userForm.country);
        formData.append("zipCode", userForm.zipCode);
      }

      // Handle avatar upload/replace with Firebase
      if (userForm.avatarFile) {
        const newAvatarUrl = await replaceImageClient(userForm.avatarFile, userForm.avatar || undefined);
        if (newAvatarUrl) {
          formData.append("avatar", newAvatarUrl);
        }
      } else if (userForm.removeAvatar) {
        // Handle avatar removal
        await replaceImageClient(null, userForm.avatar || undefined);
        formData.append("avatar", "");
      }

      await dispatch(updateUser({ id: selectedUserId, data: formData })).unwrap();
      toast.success("User details updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Error updating user");
    } finally {
      setIsUserSubmitting(false);
    }
  };

  // Handle Invite Form Submit
  const handleInviteSubmit = async () => {
    if (!selectedUserId || isInviteSubmitting) return;

    setIsInviteSubmitting(true);

    try {
      // First toggle invite status if needed
      if (selectedUser?.invite?.isEnabled !== inviteForm.isEnabled) {
        await dispatch(toggleInviteStatus({
          roleId: selectedUserId,
          isEnabled: inviteForm.isEnabled
        })).unwrap();
      }

      // Update invite theme
      await dispatch(updateInviteTheme({
        roleId: selectedUserId,
        theme: inviteForm.theme
      })).unwrap();

      // Update full invite data
      const inviteData = {
        about: inviteForm.about,
        invitation: inviteForm.invitation,
        weddingEvents: inviteForm.weddingEvents,
        loveStory: inviteForm.loveStory,
        planning: inviteForm.planning,
      };

      await dispatch(updateInvite({
        roleId: selectedUserId,
        inviteData
      })).unwrap();

      toast.success("Wedding invite updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Error updating invite");
    } finally {
      setIsInviteSubmitting(false);
    }
  };

  // Handle RSVP Status Update
  const handleRSVPStatusUpdate = async (rsvpId: string, status: 'pending' | 'confirmed' | 'declined') => {
    if (!selectedUserId || isRSVPSubmitting) return;

    setIsRSVPSubmitting(true);

    try {
      await dispatch(updateRSVPStatus({
        rsvpId,
        userId: selectedUserId,
        status
      })).unwrap();
      toast.success("RSVP status updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Error updating RSVP status");
    } finally {
      setIsRSVPSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId || isUserSubmitting) return;

    setIsUserSubmitting(true);

    try {
      await dispatch(deleteUser(selectedUserId)).unwrap();
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      resetForms();
    } catch (err: any) {
      toast.error(err?.message || "Error deleting user");
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (userForm.avatarFile && userForm.avatar?.startsWith("blob:")) {
        URL.revokeObjectURL(userForm.avatar);
      }

      setUserForm({
        ...userForm,
        avatar: URL.createObjectURL(file),
        avatarFile: file,
        removeAvatar: false,
      });
    }
  };

  const handleRemoveAvatar = () => {
    if (userForm.avatarFile && userForm.avatar?.startsWith("blob:")) {
      URL.revokeObjectURL(userForm.avatar);
    }

    setUserForm({
      ...userForm,
      avatar: null,
      avatarFile: null,
      removeAvatar: true,
    });
  };

  // Add new wedding event
  const addWeddingEvent = () => {
    const newEvent: WeddingEvent = {
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      image: '',
    };
    setInviteForm({
      ...inviteForm,
      weddingEvents: [...inviteForm.weddingEvents, newEvent],
    });
  };

  // Update wedding event
  const updateWeddingEventLocal = async (index: number, updatedEvent: WeddingEvent, newImage?: File) => {
    try {
      const updatedEvents = [...inviteForm.weddingEvents];

      // Handle image upload if there's a new image
      if (newImage) {
        const newImageUrl = await uploadImageClient(newImage);
        updatedEvent.image = newImageUrl;
      }

      updatedEvents[index] = updatedEvent;
      setInviteForm({
        ...inviteForm,
        weddingEvents: updatedEvents,
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image");
    }
  };

  // Remove wedding event
  const removeWeddingEvent = (index: number) => {
    const updatedEvents = inviteForm.weddingEvents.filter((_, i) => i !== index);
    setInviteForm({
      ...inviteForm,
      weddingEvents: updatedEvents,
    });
  };

  // --- Table Columns (shadcn style, similar to contact table) ---
  // See: https://ui.shadcn.com/docs/components/table
  // Table columns: Avatar, Name, Email, Role, Phone, Location, Notifications, Invite Status, Actions

  // --- Forms (same as before, for dialog tabs) ---
  // ... (renderUserForm, renderInviteForm, renderRSVPForm) -- unchanged, see below

  // Form 1: User Details
  const renderUserForm = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            placeholder="User name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            placeholder="Email address"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
            className="w-full px-3 py-2 border rounded-md text-sm"
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
            value={userForm.phoneNumber}
            onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
            placeholder="Phone number"
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="grid gap-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={userForm.street}
          onChange={(e) => setUserForm({ ...userForm, street: e.target.value })}
          placeholder="Street address"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={userForm.city}
            onChange={(e) => setUserForm({ ...userForm, city: e.target.value })}
            placeholder="City"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={userForm.state}
            onChange={(e) => setUserForm({ ...userForm, state: e.target.value })}
            placeholder="State"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={userForm.country}
            onChange={(e) => setUserForm({ ...userForm, country: e.target.value })}
            placeholder="Country"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={userForm.zipCode}
            onChange={(e) => setUserForm({ ...userForm, zipCode: e.target.value })}
            placeholder="ZIP Code"
          />
        </div>
      </div>

      {/* Avatar Section */}
      <div className="grid gap-2">
        <Label htmlFor="avatar">Avatar</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
        {userForm.avatar && (
          <div className="flex items-center gap-4 mt-2">
            <img
              src={userForm.avatar}
              alt="Avatar preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full flex-shrink-0"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveAvatar}
            >
              Remove Avatar
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleUserSubmit}
          disabled={isUserSubmitting}
          className="w-full sm:w-auto"
        >
          {isUserSubmitting ? "Saving User Details..." : "Save User Details"}
        </Button>
      </div>
    </div>
  );

  // Form 2: Wedding Invite
  const renderInviteForm = () => (
    <div className="space-y-6">
      {/* Invite Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isEnabled"
          checked={inviteForm.isEnabled}
          onCheckedChange={(checked) => setInviteForm({ ...inviteForm, isEnabled: checked })}
        />
        <Label htmlFor="isEnabled">Enable Wedding Invite</Label>
      </div>

      {/* Theme Section */}
      <div className="space-y-4">
        <h4 className="font-semibold">Theme Colors</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              id="primaryColor"
              type="color"
              value={inviteForm.theme.primaryColor}
              onChange={(e) => setInviteForm({
                ...inviteForm,
                theme: { ...inviteForm.theme, primaryColor: e.target.value }
              })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="titleColor">Title Color</Label>
            <Input
              id="titleColor"
              type="color"
              value={inviteForm.theme.titleColor}
              onChange={(e) => setInviteForm({
                ...inviteForm,
                theme: { ...inviteForm.theme, titleColor: e.target.value }
              })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nameColor">Name Color</Label>
            <Input
              id="nameColor"
              type="color"
              value={inviteForm.theme.nameColor}
              onChange={(e) => setInviteForm({
                ...inviteForm,
                theme: { ...inviteForm.theme, nameColor: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-4">
        <h4 className="font-semibold">About Section</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="aboutTitle">About Title</Label>
            <Input
              id="aboutTitle"
              value={inviteForm.about.title}
              onChange={(e) => setInviteForm({
                ...inviteForm,
                about: { ...inviteForm.about, title: e.target.value }
              })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="aboutSubtitle">About Subtitle</Label>
            <Input
              id="aboutSubtitle"
              value={inviteForm.about.subtitle}
              onChange={(e) => setInviteForm({
                ...inviteForm,
                about: { ...inviteForm.about, subtitle: e.target.value }
              })}
            />
          </div>
        </div>

        {/* Groom Details */}
        <div className="border p-4 rounded-lg">
          <h5 className="font-medium mb-3">Groom Details</h5>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="groomName">Groom Name</Label>
              <Input
                id="groomName"
                value={inviteForm.about.groom.name}
                onChange={(e) => setInviteForm({
                  ...inviteForm,
                  about: {
                    ...inviteForm.about,
                    groom: { ...inviteForm.about.groom, name: e.target.value }
                  }
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groomImage">Groom Image URL</Label>
              <Input
                id="groomImage"
                value={inviteForm.about.groom.image}
                onChange={(e) => setInviteForm({
                  ...inviteForm,
                  about: {
                    ...inviteForm.about,
                    groom: { ...inviteForm.about.groom, image: e.target.value }
                  }
                })}
              />
            </div>
          </div>
          <div className="grid gap-2 mt-4">
            <Label htmlFor="groomDescription">Groom Description</Label>
            <textarea
              id="groomDescription"
              value={inviteForm.about.groom.description}
              onChange={(e) => setInviteForm({
                ...inviteForm,
                about: {
                  ...inviteForm.about,
                  groom: { ...inviteForm.about.groom, description: e.target.value }
                }
              })}
              className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
            />
          </div>
        </div>

        {/* Bride Details */}
        <div className="border p-4 rounded-lg">
          <h5 className="font-medium mb-3">Bride Details</h5>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="brideName">Bride Name</Label>
              <Input
                id="brideName"
                value={inviteForm.about.bride.name}
                onChange={(e) => setInviteForm({
                  ...inviteForm,
                  about: {
                    ...inviteForm.about,
                    bride: { ...inviteForm.about.bride, name: e.target.value }
                  }
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brideImage">Bride Image URL</Label>
              <Input
                id="brideImage"
                value={inviteForm.about.bride.image}
                onChange={(e) => setInviteForm({
                  ...inviteForm,
                  about: {
                    ...inviteForm.about,
                    bride: { ...inviteForm.about.bride, image: e.target.value }
                  }
                })}
              />
            </div>
          </div>
          <div className="grid gap-2 mt-4">
            <Label htmlFor="brideDescription">Bride Description</Label>
            <textarea
              id="brideDescription"
              value={inviteForm.about.bride.description}
              onChange={(e) => setInviteForm({
                ...inviteForm,
                about: {
                  ...inviteForm.about,
                  bride: { ...inviteForm.about.bride, description: e.target.value }
                }
              })}
              className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Wedding Events */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Wedding Events</h4>
          <Button onClick={addWeddingEvent} size="sm">Add Event</Button>
        </div>
        {inviteForm.weddingEvents.map((event, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`eventTitle${index}`}>Event Title</Label>
                <Input
                  id={`eventTitle${index}`}
                  value={event.title}
                  onChange={(e) => updateWeddingEventLocal(index, { ...event, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`eventDate${index}`}>Date</Label>
                <Input
                  id={`eventDate${index}`}
                  type="datetime-local"
                  value={event.date}
                  onChange={(e) => updateWeddingEventLocal(index, { ...event, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`eventTime${index}`}>Time</Label>
                <Input
                  id={`eventTime${index}`}
                  value={event.time}
                  onChange={(e) => updateWeddingEventLocal(index, { ...event, time: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`eventVenue${index}`}>Venue</Label>
                <Input
                  id={`eventVenue${index}`}
                  value={event.venue}
                  onChange={(e) => updateWeddingEventLocal(index, { ...event, venue: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor={`eventDescription${index}`}>Description</Label>
              <textarea
                id={`eventDescription${index}`}
                value={event.description}
                onChange={(e) => updateWeddingEventLocal(index, { ...event, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[60px]"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeWeddingEvent(index)}
              >
                Remove Event
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleInviteSubmit}
          disabled={isInviteSubmitting}
          className="w-full sm:w-auto"
        >
          {isInviteSubmitting ? "Saving Invite..." : "Save Wedding Invite"}
        </Button>
      </div>
    </div>
  );

  // Form 3: RSVP Management
  const renderRSVPForm = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">RSVP Responses</h4>
        <Button
          onClick={() => selectedUserId && dispatch(fetchRSVPResponses(selectedUserId))}
          size="sm"
          disabled={rsvpLoading}
        >
          {rsvpLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      {rsvpError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {rsvpError}
        </div>
      )}
      {rsvpResponses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No RSVP responses yet</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {rsvpResponses.map((rsvp) => (
            <div key={rsvp.id} className="border p-4 rounded-lg">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p><strong>Name:</strong> {rsvp.name}</p>
                  <p><strong>Email:</strong> {rsvp.email}</p>
                  {rsvp.phone && <p><strong>Phone:</strong> {rsvp.phone}</p>}
                </div>
                <div>
                  <p><strong>Guests:</strong> {rsvp.numberOfGuests}</p>
                  <p><strong>Attending:</strong> {rsvp.attending ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {new Date(rsvp.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {rsvp.message && (
                <div className="mt-3">
                  <p><strong>Message:</strong></p>
                  <p className="text-sm text-gray-600">{rsvp.message}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant={rsvp.status === 'confirmed' ? 'default' : 'outline'}
                  onClick={() => handleRSVPStatusUpdate(rsvp.id, 'confirmed')}
                  disabled={isRSVPSubmitting}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant={rsvp.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleRSVPStatusUpdate(rsvp.id, 'pending')}
                  disabled={isRSVPSubmitting}
                >
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant={rsvp.status === 'declined' ? 'destructive' : 'outline'}
                  onClick={() => handleRSVPStatusUpdate(rsvp.id, 'declined')}
                  disabled={isRSVPSubmitting}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <Button
          onClick={() => selectedUserId && dispatch(fetchRSVPResponses(selectedUserId))}
          disabled={rsvpLoading}
          className="w-full sm:w-auto"
        >
          {rsvpLoading ? "Refreshing RSVPs..." : "Refresh RSVP Data"}
        </Button>
      </div>
    </div>
  );

  // --- Main Table UI ---
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Users Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQueryLocal(e.target.value);
              dispatch(setSearchQuery(e.target.value));
            }}
            className="w-full sm:w-64"
          />
        </div>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Avatar</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Phone</th>
              <th className="px-4 py-3 text-left font-semibold">Location</th>
              <th className="px-4 py-3 text-left font-semibold">Notifications</th>
              <th className="px-4 py-3 text-left font-semibold">Invite Status</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-8">Loading...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.name}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <span className="text-lg font-bold">{user.name[0]}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3">{user.phoneNumber || "-"}</td>
                  <td className="px-4 py-3">
                    {user.address
                      ? `${user.address.city || ""}${user.address.city && user.address.country ? ", " : ""}${user.address.country || ""}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {user.notifications.filter((n) => !n.read).length} unread
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "user" ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!user.invite?.isEnabled}
                          onCheckedChange={async (checked) => {
                            try {
                              await dispatch(toggleInviteStatus({
                                roleId: user.id,
                                isEnabled: checked
                              })).unwrap();
                              toast.success("Invite status updated successfully");
                            } catch (err: any) {
                              toast.error(err?.message || "Failed to update invite status");
                            }
                          }}
                          aria-label="Enable Wedding Invite"
                        />
                        <span className="text-xs">
                          {user.invite?.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Dialog open={isEditDialogOpen && selectedUserId === user.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                            size="sm"
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
                          <DialogHeader>
                            <DialogTitle>Edit User - {selectedUser?.name}</DialogTitle>
                            <DialogDescription>
                              Manage user details, wedding invite, and RSVP responses.
                            </DialogDescription>
                          </DialogHeader>
                          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="user">User Details</TabsTrigger>
                              <TabsTrigger
                                value="invite"
                                disabled={selectedUser?.role !== "user"}
                              >
                                Wedding Invite
                              </TabsTrigger>
                              <TabsTrigger
                                value="rsvp"
                                disabled={selectedUser?.role !== "user" || !selectedUser?.invite?.isEnabled}
                              >
                                RSVP Responses
                              </TabsTrigger>
                            </TabsList>
                            <div className="max-h-[60vh] overflow-y-auto px-1 mt-4">
                              <TabsContent value="user" className="mt-0">
                                {renderUserForm()}
                              </TabsContent>
                              <TabsContent value="invite" className="mt-0">
                                {selectedUser?.role === "user" ? renderInviteForm() : (
                                  <p className="text-center py-8 text-gray-500">
                                    Wedding invites are only available for users with role "user"
                                  </p>
                                )}
                              </TabsContent>
                              <TabsContent value="rsvp" className="mt-0">
                                {selectedUser?.role === "user" && selectedUser?.invite?.isEnabled ? renderRSVPForm() : (
                                  <p className="text-center py-8 text-gray-500">
                                    RSVP management is only available for users with enabled wedding invites
                                  </p>
                                )}
                              </TabsContent>
                            </div>
                          </Tabs>
                          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditDialogOpen(false);
                                resetForms();
                              }}
                              className="w-full sm:w-auto"
                            >
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog open={isDeleteDialogOpen && selectedUserId === user.id} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            size="sm"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[95vw] max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              user's account and remove their data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={isUserSubmitting}
                              className="w-full sm:w-auto"
                            >
                              {isUserSubmitting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* 
        Why is there no need for a weddingEvent thunk?
        ------------------------------------------------
        Because all wedding event CRUD (add, update, remove) is handled as part of the invite object
        and is updated via the updateInvite thunk/action. There is no separate API endpoint or slice
        for wedding events; they are always part of the invite data structure. So, updating the invite
        (with new/changed weddingEvents) is sufficient and no separate thunk is needed.
      */}
    </div>
  );
}