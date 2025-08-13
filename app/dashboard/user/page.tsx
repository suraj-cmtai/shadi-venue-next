'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Check, 
  Image, 
  Palette, 
  Share2, 
  Type, 
  Users, 
  X, 
  Save,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Heart,
  User,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { AppDispatch } from '@/lib/redux/store';
import { selectAuth } from '@/lib/redux/features/authSlice';
import { 
  selectSelectedUser, 
  fetchUserById, 
  updateUser,
  updateInvite,
  updateInviteTheme
} from '@/lib/redux/features/userSlice';
import { 
  fetchRSVPResponses, 
  selectRSVPResponses, 
  updateRSVPStatus 
} from '@/lib/redux/features/rsvpSlice';

// Types from the slices
interface Theme {
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  nameColor: string;
  backgroundColor: string;
  textColor: string;
}

interface Social {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface Person {
  name: string;
  description: string;
  image: string;
  socials: Social;
}

interface AboutSection {
  title: string;
  subtitle: string;
  groom: Person;
  bride: Person;
  coupleImage: string;
}

interface WeddingEvent {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image?: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image?: string;
}

interface PlanningItem {
  title: string;
  description: string;
  icon?: string;
  completed: boolean;
}

interface InviteSection {
  heading: string;
  subheading: string;
  message: string;
  rsvpLink?: string;
  backgroundImage?: string;
}

interface RSVPResponse {
  id: string;
  inviteId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  numberOfGuests: number;
  message?: string;
  attending: boolean;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'declined';
}

export default function UserDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectSelectedUser);
  const rsvpResponses = useSelector(selectRSVPResponses);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Loading states for each section
  const [themeLoading, setThemeLoading] = useState(false);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [loveStoryLoading, setLoveStoryLoading] = useState(false);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Form states
  const [themeForm, setThemeForm] = useState<Theme>({
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    titleColor: '#000000',
    nameColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  });

  const [aboutForm, setAboutForm] = useState<AboutSection>({
    title: '',
    subtitle: '',
    groom: {
      name: '',
      description: '',
      image: '',
      socials: { instagram: '', facebook: '', twitter: '' }
    },
    bride: {
      name: '',
      description: '',
      image: '',
      socials: { instagram: '', facebook: '', twitter: '' }
    },
    coupleImage: ''
  });

  const [eventsForm, setEventsForm] = useState<WeddingEvent[]>([]);
  const [loveStoryForm, setLoveStoryForm] = useState<TimelineEvent[]>([]);
  const [planningForm, setPlanningForm] = useState<PlanningItem[]>([]);
  const [invitationForm, setInvitationForm] = useState<InviteSection>({
    heading: '',
    subheading: '',
    message: '',
    rsvpLink: '',
    backgroundImage: ''
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    avatar: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    if (auth?.data?.roleId) {
      dispatch(fetchUserById(auth.data.roleId));
      dispatch(fetchRSVPResponses(auth.data.roleId));
    }
  }, [dispatch, auth?.data?.roleId]);

  // Update form states when user data loads
  useEffect(() => {
    if (user?.invite) {
      setThemeForm(user.invite.theme || themeForm);
      setAboutForm(user.invite.about || aboutForm);
      setEventsForm(user.invite.weddingEvents || []);
      setLoveStoryForm(user.invite.loveStory || []);
      setPlanningForm(user.invite.planning || []);
      setInvitationForm(user.invite.invitation || invitationForm);
    }
    
    // Update profile form
    if (user) {
      setProfileForm({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        avatar: user.avatar || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);

  // Save functions
  const handleSaveTheme = async () => {
    if (!auth?.data?.roleId) return;
    setThemeLoading(true);
    try {
      await dispatch(updateInviteTheme({
        roleId: auth.data.roleId,
        theme: themeForm
      })).unwrap();
      toast.success("Theme saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save theme");
    } finally {
      setThemeLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!auth?.data?.roleId) return;
    setAboutLoading(true);
    try {
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { about: aboutForm }
      })).unwrap();
      toast.success("About section saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save about section");
    } finally {
      setAboutLoading(false);
    }
  };

  const handleSaveEvents = async () => {
    if (!auth?.data?.roleId) return;
    setEventsLoading(true);
    try {
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { weddingEvents: eventsForm }
      })).unwrap();
      toast.success("Wedding events saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save wedding events");
    } finally {
      setEventsLoading(false);
    }
  };

  const handleSaveLoveStory = async () => {
    if (!auth?.data?.roleId) return;
    setLoveStoryLoading(true);
    try {
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { loveStory: loveStoryForm }
      })).unwrap();
      toast.success("Love story saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save love story");
    } finally {
      setLoveStoryLoading(false);
    }
  };

  const handleSavePlanning = async () => {
    if (!auth?.data?.roleId) return;
    setPlanningLoading(true);
    try {
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { planning: planningForm }
      })).unwrap();
      toast.success("Planning saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save planning");
    } finally {
      setPlanningLoading(false);
    }
  };

  const handleSaveInvitation = async () => {
    if (!auth?.data?.roleId) return;
    setInvitationLoading(true);
    try {
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { invitation: invitationForm }
      })).unwrap();
      toast.success("Invitation saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save invitation");
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth?.data?.roleId) return;
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      if (profileForm.phoneNumber) formData.append('phoneNumber', profileForm.phoneNumber);
      if (profileForm.avatar) formData.append('avatar', profileForm.avatar);
      formData.append('address', JSON.stringify(profileForm.address));

      await dispatch(updateUser({ 
        id: auth.data.roleId, 
        data: formData 
      })).unwrap();
      toast.success("Profile saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRSVPStatusUpdate = async (rsvpId: string, status: 'confirmed' | 'declined') => {
    if (!auth?.data?.roleId) return;
    try {
      await dispatch(updateRSVPStatus({ 
        rsvpId, 
        userId: auth.data.roleId, 
        status 
      })).unwrap();
      toast.success(`RSVP ${status}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update RSVP status");
    }
  };

  // Helper functions for array management
  const addWeddingEvent = () => {
    setEventsForm([...eventsForm, {
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      image: ''
    }]);
  };

  const removeWeddingEvent = (index: number) => {
    setEventsForm(eventsForm.filter((_, i) => i !== index));
  };

  const addLoveStoryEvent = () => {
    setLoveStoryForm([...loveStoryForm, {
      date: '',
      title: '',
      description: '',
      image: ''
    }]);
  };

  const removeLoveStoryEvent = (index: number) => {
    setLoveStoryForm(loveStoryForm.filter((_, i) => i !== index));
  };

  const addPlanningItem = () => {
    setPlanningForm([...planningForm, {
      title: '',
      description: '',
      icon: '',
      completed: false
    }]);
  };

  const removePlanningItem = (index: number) => {
    setPlanningForm(planningForm.filter((_, i) => i !== index));
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Share Link */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Wedding Invite</h1>
          <p className="text-gray-500">Customize your invite and manage RSVPs</p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href={`/invite/${auth?.data?.roleId}`} target="_blank">
              <Share2 className="w-4 h-4 mr-2" />
              Preview Invite
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="content">
            <Type className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="story">
            <Heart className="w-4 h-4 mr-2" />
            Love Story
          </TabsTrigger>
          <TabsTrigger value="rsvp">
            <Users className="w-4 h-4 mr-2" />
            RSVP
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Basic Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileName">Full Name</Label>
                    <Input 
                      id="profileName"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileEmail">Email (Read Only)</Label>
                    <Input 
                      id="profileEmail"
                      value={user?.email || ''}
                      readOnly
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profilePhone">Phone Number</Label>
                    <Input 
                      id="profilePhone"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileAvatar">Avatar URL</Label>
                    <Input 
                      id="profileAvatar"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileRole">Role (Read Only)</Label>
                  <Input 
                    id="profileRole"
                    value={user?.role || ''}
                    readOnly
                    disabled
                    className="bg-gray-50 capitalize"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressStreet">Street Address</Label>
                  <Input 
                    id="addressStreet"
                    value={profileForm.address.street}
                    onChange={(e) => setProfileForm({
                      ...profileForm, 
                      address: {...profileForm.address, street: e.target.value}
                    })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCity">City</Label>
                    <Input 
                      id="addressCity"
                      value={profileForm.address.city}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, city: e.target.value}
                      })}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressState">State/Province</Label>
                    <Input 
                      id="addressState"
                      value={profileForm.address.state}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, state: e.target.value}
                      })}
                      placeholder="NY"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCountry">Country</Label>
                    <Input 
                      id="addressCountry"
                      value={profileForm.address.country}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, country: e.target.value}
                      })}
                      placeholder="United States"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressZip">ZIP/Postal Code</Label>
                    <Input 
                      id="addressZip"
                      value={profileForm.address.zipCode}
                      onChange={(e) => setProfileForm({
                        ...profileForm, 
                        address: {...profileForm.address, zipCode: e.target.value}
                      })}
                      placeholder="10001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <Input 
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                      readOnly
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <Input 
                      value={user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : ''}
                      readOnly
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences & Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bookings Count</Label>
                  <Input 
                    value={user?.bookings?.length || 0}
                    readOnly
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favorite Hotels</Label>
                  <Input 
                    value={user?.favorites?.hotels?.length || 0}
                    readOnly
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favorite Vendors</Label>
                  <Input 
                    value={user?.favorites?.vendors?.length || 0}
                    readOnly
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unread Notifications</Label>
                  <Input 
                    value={user?.notifications?.filter(n => !n.read).length || 0}
                    readOnly
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            {user?.notifications && user.notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {user.notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border ${
                            notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={profileLoading}>
                {profileLoading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input 
                    id="primaryColor"
                    type="color" 
                    value={themeForm.primaryColor}
                    onChange={(e) => setThemeForm({...themeForm, primaryColor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input 
                    id="secondaryColor"
                    type="color" 
                    value={themeForm.secondaryColor}
                    onChange={(e) => setThemeForm({...themeForm, secondaryColor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleColor">Title Color</Label>
                  <Input 
                    id="titleColor"
                    type="color" 
                    value={themeForm.titleColor}
                    onChange={(e) => setThemeForm({...themeForm, titleColor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameColor">Name Color</Label>
                  <Input 
                    id="nameColor"
                    type="color" 
                    value={themeForm.nameColor}
                    onChange={(e) => setThemeForm({...themeForm, nameColor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <Input 
                    id="backgroundColor"
                    type="color" 
                    value={themeForm.backgroundColor}
                    onChange={(e) => setThemeForm({...themeForm, backgroundColor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <Input 
                    id="textColor"
                    type="color" 
                    value={themeForm.textColor}
                    onChange={(e) => setThemeForm({...themeForm, textColor: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveTheme} disabled={themeLoading}>
                  {themeLoading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Theme
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">Section Title</Label>
                    <Input 
                      id="aboutTitle"
                      value={aboutForm.title}
                      onChange={(e) => setAboutForm({...aboutForm, title: e.target.value})}
                      placeholder="About Us"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutSubtitle">Section Subtitle</Label>
                    <Input 
                      id="aboutSubtitle"
                      value={aboutForm.subtitle}
                      onChange={(e) => setAboutForm({...aboutForm, subtitle: e.target.value})}
                      placeholder="Our Story"
                    />
                  </div>
                </div>

                <Separator />

                {/* Groom Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Groom</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="groomName">Name</Label>
                      <Input 
                        id="groomName"
                        value={aboutForm.groom.name}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          groom: {...aboutForm.groom, name: e.target.value}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groomImage">Image URL</Label>
                      <Input 
                        id="groomImage"
                        value={aboutForm.groom.image}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          groom: {...aboutForm.groom, image: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groomDescription">Description</Label>
                    <Textarea 
                      id="groomDescription"
                      value={aboutForm.groom.description}
                      onChange={(e) => setAboutForm({
                        ...aboutForm, 
                        groom: {...aboutForm.groom, description: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="groomInstagram">Instagram</Label>
                      <Input 
                        id="groomInstagram"
                        value={aboutForm.groom.socials.instagram || ''}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          groom: {
                            ...aboutForm.groom, 
                            socials: {...aboutForm.groom.socials, instagram: e.target.value}
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groomFacebook">Facebook</Label>
                      <Input 
                        id="groomFacebook"
                        value={aboutForm.groom.socials.facebook || ''}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          groom: {
                            ...aboutForm.groom, 
                            socials: {...aboutForm.groom.socials, facebook: e.target.value}
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groomTwitter">Twitter</Label>
                      <Input 
                        id="groomTwitter"
                        value={aboutForm.groom.socials.twitter || ''}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          groom: {
                            ...aboutForm.groom, 
                            socials: {...aboutForm.groom.socials, twitter: e.target.value}
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bride Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bride</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brideName">Name</Label>
                      <Input 
                        id="brideName"
                        value={aboutForm.bride.name}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          bride: {...aboutForm.bride, name: e.target.value}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brideImage">Image URL</Label>
                      <Input 
                        id="brideImage"
                        value={aboutForm.bride.image}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          bride: {...aboutForm.bride, image: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brideDescription">Description</Label>
                    <Textarea 
                      id="brideDescription"
                      value={aboutForm.bride.description}
                      onChange={(e) => setAboutForm({
                        ...aboutForm, 
                        bride: {...aboutForm.bride, description: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brideInstagram">Instagram</Label>
                      <Input 
                        id="brideInstagram"
                        value={aboutForm.bride.socials.instagram || ''}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          bride: {
                            ...aboutForm.bride, 
                            socials: {...aboutForm.bride.socials, instagram: e.target.value}
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brideFacebook">Facebook</Label>
                      <Input 
                        id="brideFacebook"
                        value={aboutForm.bride.socials.facebook || ''}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          bride: {
                            ...aboutForm.bride, 
                            socials: {...aboutForm.bride.socials, facebook: e.target.value}
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brideTwitter">Twitter</Label>
                      <Input 
                        id="brideTwitter"
                        value={aboutForm.bride.socials.twitter || ''}
                        onChange={(e) => setAboutForm({
                          ...aboutForm, 
                          bride: {
                            ...aboutForm.bride, 
                            socials: {...aboutForm.bride.socials, twitter: e.target.value}
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="coupleImage">Couple Image URL</Label>
                  <Input 
                    id="coupleImage"
                    value={aboutForm.coupleImage}
                    onChange={(e) => setAboutForm({...aboutForm, coupleImage: e.target.value})}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAbout} disabled={aboutLoading}>
                    {aboutLoading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save About Section
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invitation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Invitation Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteHeading">Heading</Label>
                    <Input 
                      id="inviteHeading"
                      value={invitationForm.heading}
                      onChange={(e) => setInvitationForm({...invitationForm, heading: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteSubheading">Subheading</Label>
                    <Input 
                      id="inviteSubheading"
                      value={invitationForm.subheading}
                      onChange={(e) => setInvitationForm({...invitationForm, subheading: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteMessage">Message</Label>
                  <Textarea 
                    id="inviteMessage"
                    value={invitationForm.message}
                    onChange={(e) => setInvitationForm({...invitationForm, message: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rsvpLink">RSVP Link</Label>
                    <Input 
                      id="rsvpLink"
                      value={invitationForm.rsvpLink || ''}
                      onChange={(e) => setInvitationForm({...invitationForm, rsvpLink: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteBackground">Background Image</Label>
                    <Input 
                      id="inviteBackground"
                      value={invitationForm.backgroundImage || ''}
                      onChange={(e) => setInvitationForm({...invitationForm, backgroundImage: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveInvitation} disabled={invitationLoading}>
                    {invitationLoading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Invitation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Wedding Events</CardTitle>
                <Button onClick={addWeddingEvent} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {eventsForm.map((event, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Event {index + 1}</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeWeddingEvent(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`eventTitle${index}`}>Title</Label>
                      <Input 
                        id={`eventTitle${index}`}
                        value={event.title}
                        onChange={(e) => {
                          const newEvents = [...eventsForm];
                          newEvents[index].title = e.target.value;
                          setEventsForm(newEvents);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`eventVenue${index}`}>Venue</Label>
                      <Input 
                        id={`eventVenue${index}`}
                        value={event.venue}
                        onChange={(e) => {
                          const newEvents = [...eventsForm];
                          newEvents[index].venue = e.target.value;
                          setEventsForm(newEvents);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`eventDate${index}`}>Date</Label>
                      <Input 
                        id={`eventDate${index}`}
                        type="date"
                        value={event.date}
                        onChange={(e) => {
                          const newEvents = [...eventsForm];
                          newEvents[index].date = e.target.value;
                          setEventsForm(newEvents);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`eventTime${index}`}>Time</Label>
                      <Input 
                        id={`eventTime${index}`}
                        type="time"
                        value={event.time}
                        onChange={(e) => {
                          const newEvents = [...eventsForm];
                          newEvents[index].time = e.target.value;
                          setEventsForm(newEvents);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`eventDescription${index}`}>Description</Label>
                    <Textarea 
                      id={`eventDescription${index}`}
                      value={event.description}
                      onChange={(e) => {
                        const newEvents = [...eventsForm];
                        newEvents[index].description = e.target.value;
                        setEventsForm(newEvents);
                      }}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`eventImage${index}`}>Image URL</Label>
                    <Input 
                      id={`eventImage${index}`}
                      value={event.image || ''}
                      onChange={(e) => {
                        const newEvents = [...eventsForm];
                        newEvents[index].image = e.target.value;
                        setEventsForm(newEvents);
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={handleSaveEvents} disabled={eventsLoading}>
                  {eventsLoading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Events
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Love Story Tab */}
        <TabsContent value="story">
          <div className="space-y-6">
            {/* Love Story Timeline */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Love Story Timeline</CardTitle>
                  <Button onClick={addLoveStoryEvent} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loveStoryForm.map((event, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Timeline Event {index + 1}</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeLoveStoryEvent(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`storyDate${index}`}>Date</Label>
                        <Input 
                          id={`storyDate${index}`}
                          value={event.date}
                          onChange={(e) => {
                            const newStory = [...loveStoryForm];
                            newStory[index].date = e.target.value;
                            setLoveStoryForm(newStory);
                          }}
                          placeholder="e.g., March 2020"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`storyTitle${index}`}>Title</Label>
                        <Input 
                          id={`storyTitle${index}`}
                          value={event.title}
                          onChange={(e) => {
                            const newStory = [...loveStoryForm];
                            newStory[index].title = e.target.value;
                            setLoveStoryForm(newStory);
                          }}
                          placeholder="e.g., First Meeting"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`storyDescription${index}`}>Description</Label>
                      <Textarea 
                        id={`storyDescription${index}`}
                        value={event.description}
                        onChange={(e) => {
                          const newStory = [...loveStoryForm];
                          newStory[index].description = e.target.value;
                          setLoveStoryForm(newStory);
                        }}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`storyImage${index}`}>Image URL</Label>
                      <Input 
                        id={`storyImage${index}`}
                        value={event.image || ''}
                        onChange={(e) => {
                          const newStory = [...loveStoryForm];
                          newStory[index].image = e.target.value;
                          setLoveStoryForm(newStory);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleSaveLoveStory} disabled={loveStoryLoading}>
                    {loveStoryLoading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Love Story
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Planning Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Wedding Planning</CardTitle>
                  <Button onClick={addPlanningItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {planningForm.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Planning Item {index + 1}</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removePlanningItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`planningTitle${index}`}>Title</Label>
                        <Input 
                          id={`planningTitle${index}`}
                          value={item.title}
                          onChange={(e) => {
                            const newPlanning = [...planningForm];
                            newPlanning[index].title = e.target.value;
                            setPlanningForm(newPlanning);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`planningIcon${index}`}>Icon</Label>
                        <Input 
                          id={`planningIcon${index}`}
                          value={item.icon || ''}
                          onChange={(e) => {
                            const newPlanning = [...planningForm];
                            newPlanning[index].icon = e.target.value;
                            setPlanningForm(newPlanning);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`planningDescription${index}`}>Description</Label>
                      <Textarea 
                        id={`planningDescription${index}`}
                        value={item.description}
                        onChange={(e) => {
                          const newPlanning = [...planningForm];
                          newPlanning[index].description = e.target.value;
                          setPlanningForm(newPlanning);
                        }}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`planningCompleted${index}`}
                        checked={item.completed}
                        onChange={(e) => {
                          const newPlanning = [...planningForm];
                          newPlanning[index].completed = e.target.checked;
                          setPlanningForm(newPlanning);
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`planningCompleted${index}`}>Completed</Label>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleSavePlanning} disabled={planningLoading}>
                    {planningLoading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Planning
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RSVP Tab */}
        <TabsContent value="rsvp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>RSVP Responses</span>
                <span className="text-sm text-muted-foreground">
                  {rsvpResponses?.length || 0} responses
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {rsvpResponses && rsvpResponses.length > 0 ? (
                    rsvpResponses.map((response) => (
                      <div
                        key={response.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-lg">{response.name}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              response.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : response.status === 'declined'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Email:</span>
                              {response.email}
                            </p>
                            {response.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span className="font-medium">Phone:</span>
                                {response.phone}
                              </p>
                            )}
                            <p className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">Guests:</span>
                              {response.numberOfGuests}
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Attending:</span>
                              <span className={response.attending ? 'text-green-600' : 'text-red-600'}>
                                {response.attending ? 'Yes' : 'No'}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(response.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {response.message && (
                            <div className="mt-3 p-2 bg-gray-50 rounded italic text-sm">
                              "{response.message}"
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant={response.status === 'confirmed' ? 'default' : 'outline'}
                            onClick={() => handleRSVPStatusUpdate(response.id, 'confirmed')}
                            disabled={response.status === 'confirmed'}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant={response.status === 'declined' ? 'destructive' : 'outline'}
                            onClick={() => handleRSVPStatusUpdate(response.id, 'declined')}
                            disabled={response.status === 'declined'}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No RSVP responses yet</h3>
                      <p className="text-gray-500">
                        Share your invite link to start receiving responses from your guests.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}