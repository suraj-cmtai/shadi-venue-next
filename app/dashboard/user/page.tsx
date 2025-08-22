'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImageClient, replaceImageClient } from '@/lib/firebase-client';
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
  Phone,
  Heart,
  User,
  Bell,
  Upload,
  Edit,
  Eye,
  Download,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Globe,
  Settings,
  Sparkles
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { AppDispatch } from '@/lib/redux/store';
import { selectAuth } from '@/lib/redux/features/authSlice';
import {
  selectSelectedUser,
  selectUserLoading,
  selectUserError,
  fetchUserById,
  updateUser,
  updateInvite,
  updateInviteTheme,
  toggleInviteStatus
} from '@/lib/redux/features/userSlice';
import {
  fetchActiveHotels,
  selectActiveHotels,
} from '@/lib/redux/features/hotelSlice';
import {
  fetchRSVPResponses,
  selectRSVPResponses,
  updateRSVPStatus
} from '@/lib/redux/features/rsvpSlice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface PersonForm {
  name: string;
  description: string;
  image: string | File;
  socials: Social;
}

interface AboutSectionForm {
  title: string;
  subtitle: string;
  groom: PersonForm;
  bride: PersonForm;
  coupleImage: string | File;
}

interface WeddingEventForm {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image?: string | File;
}

interface TimelineEventForm {
  date: string;
  title: string;
  description: string;
  image?: string | File;
}

interface PlanningItem {
  title: string;
  description: string;
  icon?: string;
  completed: boolean;
}

interface InviteSectionForm {
  heading: string;
  subheading: string;
  message: string;
  rsvpLink?: string;
  backgroundImage?: string | File;
}

// Theme presets for quick selection
const THEME_PRESETS = [
  {
    name: 'Royal Elegance',
    theme: {
      primaryColor: '#D4AF37',      // Deep Gold
      secondaryColor: '#F7E7CE',    // Champagne
      titleColor: '#800000',        // Maroon
      nameColor: '#003366',         // Dark Blue
      backgroundColor: '#FFFFF0',   // Ivory
      textColor: '#FADADD'          // Soft Pink
    }
  },
  {
    name: 'Vintage Glamour',
    theme: {
      primaryColor: '#B76E79',      // Rose Gold
      secondaryColor: '#F2C1D1',    // Blush Pink
      titleColor: '#C8A2C8',        // Lavender
      nameColor: '#FFD700',         // Gold Accents
      backgroundColor: '#FFFFF0',   // Ivory
      textColor: '#E0E0E0'          // Pale Grey
    }
  },
  {
    name: 'Traditional Richness',
    theme: {
      primaryColor: '#A52A2A',      // Deep Red
      secondaryColor: '#FFD700',    // Gold
      titleColor: '#800000',        // Maroon
      nameColor: '#50C878',         // Emerald Green
      backgroundColor: '#FFFFF0',   // Ivory
      textColor: '#CD7F32'          // Bronze
    }
  },
  {
    name: 'Contemporary Brights',
    theme: {
      primaryColor: '#40E0D0',      // Turquoise Blue
      secondaryColor: '#FF69B4',    // Hot Pink
      titleColor: '#FFD700',        // Bright Yellow
      nameColor: '#FF7F50',         // Soft Coral
      backgroundColor: '#FFFFFF',   // White
      textColor: '#98FF98'          // Light Mint
    }
  },
  {
    name: 'Elegant Pastels',
    theme: {
      primaryColor: '#98FF98',      // Mint Green
      secondaryColor: '#FFDAB9',    // Peach
      titleColor: '#E6E6FA',        // Lavender
      nameColor: '#FFB6C1',         // Light Pink
      backgroundColor: '#FAF0E6',   // Off-white
      textColor: '#FFFFE0'          // Pale Yellow
    }
  },
  {
    name: 'Cultural & Festive',
    theme: {
      primaryColor: '#4B0082',      // Deep Indigo
      secondaryColor: '#FFD700',    // Gold
      titleColor: '#DC143C',        // Bright Crimson
      nameColor: '#40E0D0',         // Turquoise
      backgroundColor: '#FFFFF0',   // Ivory
      textColor: '#FF8C00'          // Rich Orange
    }
  }
];

export default function UserDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectSelectedUser);
  const userLoading = useSelector(selectUserLoading);
  const userError = useSelector(selectUserError);
  const rsvpResponses = useSelector(selectRSVPResponses);
  const hotels = useSelector(selectActiveHotels); 
  
  const [activeTab, setActiveTab] = useState('overview');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  // Loading states for each section
  const [sectionLoading, setSectionLoading] = useState<{[key: string]: boolean}>({});

  // Form states
  const [inviteEnabled, setInviteEnabled] = useState(false);
  const [themeForm, setThemeForm] = useState<Theme>({
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    titleColor: '#000000',
    nameColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  });

  const [aboutForm, setAboutForm] = useState<AboutSectionForm>({
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

  const [eventsForm, setEventsForm] = useState<WeddingEventForm[]>([]);
  const [loveStoryForm, setLoveStoryForm] = useState<TimelineEventForm[]>([]);
  const [planningForm, setPlanningForm] = useState<PlanningItem[]>([]);
  const [invitationForm, setInvitationForm] = useState<InviteSectionForm>({
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
    avatar: '' as string | File,
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });

  // Preview URLs for file inputs
  const [previewUrls, setPreviewUrls] = useState<{[key: string]: string}>({});

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (auth?.data?.roleId) {
      dispatch(fetchUserById(auth.data.roleId));
      dispatch(fetchRSVPResponses(auth.data.roleId));
      dispatch(fetchActiveHotels());
    }
  }, [dispatch, auth?.data?.roleId]);



  // Update form states when user data loads
  useEffect(() => {
    if (user?.invite) {
      setInviteEnabled(user.invite.isEnabled || false);
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

  // Calculate completion percentage
  const calculateCompletionPercentage = useCallback(() => {
    if (!user?.invite) return 0;
    
    let completed = 0;
    const total = 6;
    
    // Theme
    if (themeForm.primaryColor && themeForm.backgroundColor) completed++;
    // About section
    if (aboutForm.title && aboutForm.groom.name && aboutForm.bride.name) completed++;
    // Events
    if (eventsForm.length > 0 && eventsForm[0].title) completed++;
    // Love story
    if (loveStoryForm.length > 0 && loveStoryForm[0].title) completed++;
    // Planning
    if (planningForm.length > 0) completed++;
    // Invitation
    if (invitationForm.heading && invitationForm.message) completed++;
    
    return Math.round((completed / total) * 100);
  }, [themeForm, aboutForm, eventsForm, loveStoryForm, planningForm, invitationForm, user]);

  // File handling utilities
  const handleFileChange = (file: File | null, key: string) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [key]: url }));
      setUnsavedChanges(true);
    } else {
      setPreviewUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[key];
        return newUrls;
      });
    }
  };

  const handleUploadWithProgress = async (file: File, key: string) => {
    setUploadProgress(prev => ({ ...prev, [key]: 0 }));
    
    try {
      // Simulate upload progress for demo
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[key] || 0;
          if (current < 90) {
            return { ...prev, [key]: current + 10 };
          }
          return prev;
        });
      }, 100);

      const url = await uploadImageClient(file);
      
      clearInterval(interval);
      setUploadProgress(prev => ({ ...prev, [key]: 100 }));
      
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[key];
          return newProgress;
        });
      }, 1000);

      return url;
    } catch (error) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[key];
        return newProgress;
      });
      throw error;
    }
  };

  const setSectionLoadingState = (section: string, loading: boolean) => {
    setSectionLoading(prev => ({ ...prev, [section]: loading }));
  };

  // Toggle invite status
  const handleToggleInviteStatus = async () => {
    if (!auth?.data?.roleId) return;
    
    try {
      await dispatch(toggleInviteStatus({
        roleId: auth.data.roleId,
        isEnabled: !inviteEnabled
      })).unwrap();
      setInviteEnabled(!inviteEnabled);
      toast.success(`Invite ${!inviteEnabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle invite status');
    }
  };

  // Apply theme preset
  const applyThemePreset = (preset: typeof THEME_PRESETS[0]) => {
    setThemeForm(preset.theme);
    setUnsavedChanges(true);
    toast.success(`Applied ${preset.name} theme`);
  };

  // Save functions with better error handling
  const handleSaveTheme = async () => {
    if (!auth?.data?.roleId) return;
    setSectionLoadingState('theme', true);
    try {
      await dispatch(updateInviteTheme({
        roleId: auth.data.roleId,
        theme: themeForm
      })).unwrap();
      toast.success("Theme saved successfully");
      setUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save theme");
    } finally {
      setSectionLoadingState('theme', false);
    }
  };

  const handleSaveAbout = async () => {
    if (!auth?.data?.roleId) return;
    setSectionLoadingState('about', true);
    try {
      // Handle image uploads with progress
      let processedAbout = { ...aboutForm };
      
      if (aboutForm.groom.image instanceof File) {
        const groomImageUrl = await handleUploadWithProgress(aboutForm.groom.image, 'groomImage');
        processedAbout.groom.image = groomImageUrl;
      }
      
      if (aboutForm.bride.image instanceof File) {
        const brideImageUrl = await handleUploadWithProgress(aboutForm.bride.image, 'brideImage');
        processedAbout.bride.image = brideImageUrl;
      }
      
      if (aboutForm.coupleImage instanceof File) {
        const coupleImageUrl = await handleUploadWithProgress(aboutForm.coupleImage, 'coupleImage');
        processedAbout.coupleImage = coupleImageUrl;
      }
      
      const serverData = {
        title: processedAbout.title,
        subtitle: processedAbout.subtitle,
        groom: {
          name: processedAbout.groom.name,
          description: processedAbout.groom.description,
          image: processedAbout.groom.image as string,
          socials: processedAbout.groom.socials
        },
        bride: {
          name: processedAbout.bride.name,
          description: processedAbout.bride.description,
          image: processedAbout.bride.image as string,
          socials: processedAbout.bride.socials
        },
        coupleImage: processedAbout.coupleImage as string
      };
      
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { about: serverData }
      })).unwrap();
      toast.success("About section saved successfully");
      setUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save about section");
    } finally {
      setSectionLoadingState('about', false);
    }
  };

  const handleSaveEvents = async () => {
    if (!auth?.data?.roleId) return;
    setSectionLoadingState('events', true);
    try {
      const processedEvents = await Promise.all(eventsForm.map(async (event, index) => {
        if (event.image instanceof File) {
          const imageUrl = await handleUploadWithProgress(event.image, `eventImage${index}`);
          return { ...event, image: imageUrl };
        }
        return event;
      }));
      
      const serverData = processedEvents.map(event => ({
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
        description: event.description,
        image: event.image as string | undefined
      }));
      
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { weddingEvents: serverData }
      })).unwrap();
      toast.success("Wedding events saved successfully");
      setUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save wedding events");
    } finally {
      setSectionLoadingState('events', false);
    }
  };

  const handleSaveLoveStory = async () => {
    if (!auth?.data?.roleId) return;
    setSectionLoadingState('loveStory', true);
    try {
      const processedStory = await Promise.all(loveStoryForm.map(async (event, index) => {
        if (event.image instanceof File) {
          const imageUrl = await handleUploadWithProgress(event.image, `storyImage${index}`);
          return { ...event, image: imageUrl };
        }
        return event;
      }));
      
      const serverData = processedStory.map(event => ({
        title: event.title,
        date: event.date,
        description: event.description,
        image: event.image as string | undefined
      }));

      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { loveStory: serverData }
      })).unwrap();
      toast.success("Love story saved successfully");
      setUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save love story");
    } finally {
      setSectionLoadingState('loveStory', false);
    }
  };

  const handleSavePlanning = async () => {
    if (!auth?.data?.roleId) return;
    setSectionLoadingState('planning', true);
    try {
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { planning: planningForm }
      })).unwrap();
      toast.success("Planning saved successfully");
      setUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save planning");
    } finally {
      setSectionLoadingState('planning', false);
    }
  };

  const handleSaveInvitation = async () => {
    if (!auth?.data?.roleId) return;
    setSectionLoadingState('invitation', true);
    try {
      let processedInvitation = { ...invitationForm };
      
      if (invitationForm.backgroundImage instanceof File) {
        const backgroundImageUrl = await handleUploadWithProgress(invitationForm.backgroundImage, 'inviteBackground');
        processedInvitation.backgroundImage = backgroundImageUrl;
      }
      
      const serverData = {
        ...processedInvitation,
        backgroundImage: processedInvitation.backgroundImage as string
      };
      
      await dispatch(updateInvite({
        roleId: auth.data.roleId,
        inviteData: { invitation: serverData }
      })).unwrap();
      toast.success("Invitation saved successfully");
      setUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save invitation");
    } finally {
      setSectionLoadingState('invitation', false);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth?.data?.roleId) return;
    setSectionLoadingState('profile', true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      if (profileForm.phoneNumber) formData.append('phoneNumber', profileForm.phoneNumber);
      
      if (profileForm.avatar instanceof File) {
        const newAvatarUrl = await replaceImageClient(profileForm.avatar, user?.avatar);
        if (newAvatarUrl) {
          formData.append('avatar', newAvatarUrl);
        }
      } else if (typeof profileForm.avatar === 'string' && profileForm.avatar) {
        formData.append('avatar', profileForm.avatar);
      }
      
      formData.append('address', JSON.stringify(profileForm.address));

      await dispatch(updateUser({ 
        id: auth.data.roleId, 
        data: formData 
      })).unwrap();
      toast.success("Profile saved successfully");
      setUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setSectionLoadingState('profile', false);
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

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/invite/${auth?.data?.roleId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard");
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
    setUnsavedChanges(true);
  };

  const removeWeddingEvent = (index: number) => {
    setEventsForm(eventsForm.filter((_, i) => i !== index));
    setUnsavedChanges(true);
  };

  const addLoveStoryEvent = () => {
    setLoveStoryForm([...loveStoryForm, {
      date: '',
      title: '',
      description: '',
      image: ''
    }]);
    setUnsavedChanges(true);
  };

  const removeLoveStoryEvent = (index: number) => {
    setLoveStoryForm(loveStoryForm.filter((_, i) => i !== index));
    setUnsavedChanges(true);
  };

  const addPlanningItem = () => {
    setPlanningForm([...planningForm, {
      title: '',
      description: '',
      icon: '',
      completed: false
    }]);
    setUnsavedChanges(true);
  };

  const removePlanningItem = (index: number) => {
    setPlanningForm(planningForm.filter((_, i) => i !== index));
    setUnsavedChanges(true);
  };

  // Enhanced File input component
  const FileInput = ({ 
    label, 
    value, 
    onChange, 
    accept = "image/*",
    previewKey,
    description
  }: {
    label: string;
    value: string | File;
    onChange: (file: File | null) => void;
    accept?: string;
    previewKey: string;
    description?: string;
  }) => {
    const progress = uploadProgress[previewKey];
    const currentUrl = previewUrls[previewKey] || (typeof value === 'string' ? value : '');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onChange(file);
      if (file) {
        handleFileChange(file, previewKey);
      }
    };

    return (
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-${previewKey}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-${previewKey}`)?.click()}
            disabled={!!progress}
          >
            {progress ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {progress ? 'Uploading...' : 'Choose File'}
          </Button>
          {currentUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
        {progress !== undefined && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% uploaded</p>
          </div>
        )}
        {currentUrl && !progress && (
          <div className="mt-3">
            <img 
              src={currentUrl} 
              alt="Preview" 
              className="w-24 h-24 object-cover rounded-lg border border-border"
            />
          </div>
        )}
      </div>
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {userError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No user data found</p>
      </div>
    );
  }

  const completionPercentage = calculateCompletionPercentage();
  const attendingCount = rsvpResponses?.filter(r => r.attending).length || 0;
  const notAttendingCount = rsvpResponses?.filter(r => !r.attending).length || 0;
  const totalGuests = rsvpResponses?.reduce((sum, r) => sum + r.numberOfGuests, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">Your Wedding Invite</h1>
            <Badge variant={inviteEnabled ? "default" : "secondary"}>
              {inviteEnabled ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Create a beautiful invitation and manage your guest responses
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* <div className="flex items-center gap-2">
            <Switch
              checked={inviteEnabled}
              onCheckedChange={handleToggleInviteStatus}
            />
            <Label className="text-sm font-medium">
              {inviteEnabled ? "Live" : "Draft Mode"}
            </Label>
          </div> */}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyInviteLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/invite/${auth?.data?.roleId}`} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/invite/${auth?.data?.roleId}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Unsaved changes alert */}
      {unsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your work!
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invite Completion</span>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{rsvpResponses?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total RSVPs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attendingCount}</div>
                <div className="text-sm text-muted-foreground">Attending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{notAttendingCount}</div>
                <div className="text-sm text-muted-foreground">Not Attending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalGuests}</div>
                <div className="text-sm text-muted-foreground">Total Guests</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="m-4 p-1">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview">
            <Settings className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
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
            RSVP ({rsvpResponses?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('theme')}
                  >
                    <Palette className="w-6 h-6 mb-2" />
                    Customize Theme
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('content')}
                  >
                    <Edit className="w-6 h-6 mb-2" />
                    Edit Content
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('events')}
                  >
                    <Calendar className="w-6 h-6 mb-2" />
                    Add Events
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    asChild
                  >
                    <Link href={`/invite/${auth?.data?.roleId}`} target="_blank">
                      <Eye className="w-6 h-6 mb-2" />
                      Preview Invite
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Completion Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {themeForm.primaryColor && themeForm.backgroundColor ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className={themeForm.primaryColor && themeForm.backgroundColor ? 'line-through text-muted-foreground' : ''}>
                      Choose a theme and colors
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {aboutForm.title && aboutForm.groom.name && aboutForm.bride.name ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className={aboutForm.title && aboutForm.groom.name && aboutForm.bride.name ? 'line-through text-muted-foreground' : ''}>
                      Add couple information
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {eventsForm.length > 0 && eventsForm[0].title ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className={eventsForm.length > 0 && eventsForm[0].title ? 'line-through text-muted-foreground' : ''}>
                      Add wedding events
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {loveStoryForm.length > 0 && loveStoryForm[0].title ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className={loveStoryForm.length > 0 && loveStoryForm[0].title ? 'line-through text-muted-foreground' : ''}>
                      Share your love story
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {invitationForm.heading && invitationForm.message ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className={invitationForm.heading && invitationForm.message ? 'line-through text-muted-foreground' : ''}>
                      Customize invitation message
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {inviteEnabled ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                    <span className={inviteEnabled ? 'line-through text-muted-foreground' : ''}>
                      Publish your invite
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-3">
                    {rsvpResponses?.slice(0, 5).map((response) => (
                      <div key={response.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${response.attending ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{response.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {response.attending ? 'Attending' : 'Not attending'} • {response.numberOfGuests} guests
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {!rsvpResponses?.length && (
                      <p className="text-center text-muted-foreground py-8">
                        No RSVP responses yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Basic Profile Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={sectionLoading.profile}
                    size="sm"
                  >
                    {sectionLoading.profile ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="profileName">Full Name</Label>
                    <Input 
                      id="profileName"
                      value={profileForm.name}
                      onChange={(e) => {
                        setProfileForm({...profileForm, name: e.target.value});
                        setUnsavedChanges(true);
                      }}
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
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePhone">Phone Number</Label>
                    <Input 
                      id="profilePhone"
                      value={profileForm.phoneNumber}
                      onChange={(e) => {
                        setProfileForm({...profileForm, phoneNumber: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <FileInput
                    label="Profile Avatar"
                    value={profileForm.avatar}
                    onChange={(file) => {
                      setProfileForm({...profileForm, avatar: file || ''});
                      setUnsavedChanges(true);
                    }}
                    previewKey="profileAvatar"
                    description="Upload a profile picture"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="profileRole">Role (Read Only)</Label>
                    <Input 
                      id="profileRole"
                      value={user?.role || ''}
                      readOnly
                      disabled
                      className="bg-muted capitalize"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <Collapsible open={expandedSections.address} onOpenChange={() => toggleSection('address')}>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <CardTitle>Address Information</CardTitle>
                    {expandedSections.address ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressStreet">Street Address</Label>
                      <Input 
                        id="addressStreet"
                        value={profileForm.address.street}
                        onChange={(e) => {
                          setProfileForm({
                            ...profileForm, 
                            address: {...profileForm.address, street: e.target.value}
                          });
                          setUnsavedChanges(true);
                        }}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressCity">City</Label>
                        <Input 
                          id="addressCity"
                          value={profileForm.address.city}
                          onChange={(e) => {
                            setProfileForm({
                              ...profileForm, 
                              address: {...profileForm.address, city: e.target.value}
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressState">State/Province</Label>
                        <Input 
                          id="addressState"
                          value={profileForm.address.state}
                          onChange={(e) => {
                            setProfileForm({
                              ...profileForm, 
                              address: {...profileForm.address, state: e.target.value}
                            });
                            setUnsavedChanges(true);
                          }}
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
                          onChange={(e) => {
                            setProfileForm({
                              ...profileForm, 
                              address: {...profileForm.address, country: e.target.value}
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="United States"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressZip">ZIP/Postal Code</Label>
                        <Input 
                          id="addressZip"
                          value={profileForm.address.zipCode}
                          onChange={(e) => {
                            setProfileForm({
                              ...profileForm, 
                              address: {...profileForm.address, zipCode: e.target.value}
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Account Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <Input 
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <Input 
                      value={user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : ''}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bookings</Label>
                    <Input 
                      value={user?.bookings?.length || 0}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unread Notifications</Label>
                    <Input 
                      value={user?.notifications?.filter(n => !n.read).length || 0}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Notifications */}
            {user?.notifications && user.notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60">
                    <div className="space-y-3">
                      {user.notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            notification.read 
                              ? 'bg-muted/50 border-border' 
                              : 'bg-primary/5 border-primary/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-muted-foreground' : 'bg-primary'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <div className="space-y-6">
            {/* Theme Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Theme Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {THEME_PRESETS.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex-col p-4"
                      onClick={() => applyThemePreset(preset)}
                    >
                      <div className="flex gap-1 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: preset.theme.primaryColor }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: preset.theme.secondaryColor }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border" 
                          style={{ backgroundColor: preset.theme.backgroundColor }}
                        />
                      </div>
                      <span className="text-xs font-medium">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Theme */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Custom Theme & Colors</CardTitle>
                  <Button 
                    onClick={handleSaveTheme} 
                    disabled={sectionLoading.theme}
                    size="sm"
                  >
                    {sectionLoading.theme ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Theme
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="primaryColor"
                        type="color" 
                        value={themeForm.primaryColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, primaryColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input 
                        value={themeForm.primaryColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, primaryColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="secondaryColor"
                        type="color" 
                        value={themeForm.secondaryColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, secondaryColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input 
                        value={themeForm.secondaryColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, secondaryColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="titleColor">Title Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="titleColor"
                        type="color" 
                        value={themeForm.titleColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, titleColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input 
                        value={themeForm.titleColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, titleColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="nameColor">Name Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="nameColor"
                        type="color" 
                        value={themeForm.nameColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, nameColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input 
                        value={themeForm.nameColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, nameColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="backgroundColor"
                        type="color" 
                        value={themeForm.backgroundColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, backgroundColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input 
                        value={themeForm.backgroundColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, backgroundColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="textColor"
                        type="color" 
                        value={themeForm.textColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, textColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input 
                        value={themeForm.textColor}
                        onChange={(e) => {
                          setThemeForm({...themeForm, textColor: e.target.value});
                          setUnsavedChanges(true);
                        }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="space-y-3">
                  <Label>Theme Preview</Label>
                  <div 
                    className="p-6 rounded-lg border-2 space-y-4"
                    style={{ 
                      backgroundColor: themeForm.backgroundColor,
                      borderColor: themeForm.primaryColor 
                    }}
                  >
                    <h3 
                      className="text-2xl font-bold text-center"
                      style={{ color: themeForm.titleColor }}
                    >
                      Wedding Invitation
                    </h3>
                    <div className="text-center space-y-2">
                      <p 
                        className="text-lg font-semibold"
                        style={{ color: themeForm.nameColor }}
                      >
                        John & Jane
                      </p>
                      <p style={{ color: themeForm.textColor }}>
                        Together with their families, request the pleasure of your company
                      </p>
                    </div>
                    <div 
                      className="text-center p-3 rounded"
                      style={{ 
                        backgroundColor: themeForm.secondaryColor,
                        color: themeForm.textColor 
                      }}
                    >
                      Saturday, June 15th, 2024
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>About Section</CardTitle>
                  <Button 
                    onClick={handleSaveAbout} 
                    disabled={sectionLoading.about}
                    size="sm"
                  >
                    {sectionLoading.about ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save About Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">Section Title</Label>
                    <Input 
                      id="aboutTitle"
                      value={aboutForm.title}
                      onChange={(e) => {
                        setAboutForm({...aboutForm, title: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      placeholder="About Us"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutSubtitle">Section Subtitle</Label>
                    <Input 
                      id="aboutSubtitle"
                      value={aboutForm.subtitle}
                      onChange={(e) => {
                        setAboutForm({...aboutForm, subtitle: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      placeholder="Our Story"
                    />
                  </div>
                </div>

                <Separator />

                {/* Groom Section */}
                <Collapsible open={expandedSections.groom} onOpenChange={() => toggleSection('groom')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-medium">Groom Information</h3>
                    {expandedSections.groom ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="groomName">Name</Label>
                        <Input 
                          id="groomName"
                          value={aboutForm.groom.name}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              groom: {...aboutForm.groom, name: e.target.value}
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="Groom's full name"
                        />
                      </div>
                      <FileInput
                        label="Groom Image"
                        value={aboutForm.groom.image}
                        onChange={(file) => {
                          setAboutForm({
                            ...aboutForm, 
                            groom: {...aboutForm.groom, image: file || ''}
                          });
                          setUnsavedChanges(true);
                        }}
                        previewKey="groomImage"
                        description="Upload a photo of the groom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groomDescription">Description</Label>
                      <Textarea 
                        id="groomDescription"
                        value={aboutForm.groom.description}
                        onChange={(e) => {
                          setAboutForm({
                            ...aboutForm, 
                            groom: {...aboutForm.groom, description: e.target.value}
                          });
                          setUnsavedChanges(true);
                        }}
                        rows={3}
                        placeholder="Tell us about the groom..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="groomInstagram">Instagram</Label>
                        <Input 
                          id="groomInstagram"
                          value={aboutForm.groom.socials.instagram || ''}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              groom: {
                                ...aboutForm.groom, 
                                socials: {...aboutForm.groom.socials, instagram: e.target.value}
                              }
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="groomFacebook">Facebook</Label>
                        <Input 
                          id="groomFacebook"
                          value={aboutForm.groom.socials.facebook || ''}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              groom: {
                                ...aboutForm.groom, 
                                socials: {...aboutForm.groom.socials, facebook: e.target.value}
                              }
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="facebook.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="groomTwitter">Twitter</Label>
                        <Input 
                          id="groomTwitter"
                          value={aboutForm.groom.socials.twitter || ''}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              groom: {
                                ...aboutForm.groom, 
                                socials: {...aboutForm.groom.socials, twitter: e.target.value}
                              }
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Bride Section */}
                <Collapsible open={expandedSections.bride} onOpenChange={() => toggleSection('bride')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-medium">Bride Information</h3>
                    {expandedSections.bride ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="brideName">Name</Label>
                        <Input 
                          id="brideName"
                          value={aboutForm.bride.name}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              bride: {...aboutForm.bride, name: e.target.value}
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="Bride's full name"
                        />
                      </div>
                      <FileInput
                        label="Bride Image"
                        value={aboutForm.bride.image}
                        onChange={(file) => {
                          setAboutForm({
                            ...aboutForm, 
                            bride: {...aboutForm.bride, image: file || ''}
                          });
                          setUnsavedChanges(true);
                        }}
                        previewKey="brideImage"
                        description="Upload a photo of the bride"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brideDescription">Description</Label>
                      <Textarea 
                        id="brideDescription"
                        value={aboutForm.bride.description}
                        onChange={(e) => {
                          setAboutForm({
                            ...aboutForm, 
                            bride: {...aboutForm.bride, description: e.target.value}
                          });
                          setUnsavedChanges(true);
                        }}
                        rows={3}
                        placeholder="Tell us about the bride..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brideInstagram">Instagram</Label>
                        <Input 
                          id="brideInstagram"
                          value={aboutForm.bride.socials.instagram || ''}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              bride: {
                                ...aboutForm.bride, 
                                socials: {...aboutForm.bride.socials, instagram: e.target.value}
                              }
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brideFacebook">Facebook</Label>
                        <Input 
                          id="brideFacebook"
                          value={aboutForm.bride.socials.facebook || ''}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              bride: {
                                ...aboutForm.bride, 
                                socials: {...aboutForm.bride.socials, facebook: e.target.value}
                              }
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="facebook.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brideTwitter">Twitter</Label>
                        <Input 
                          id="brideTwitter"
                          value={aboutForm.bride.socials.twitter || ''}
                          onChange={(e) => {
                            setAboutForm({
                              ...aboutForm, 
                              bride: {
                                ...aboutForm.bride, 
                                socials: {...aboutForm.bride.socials, twitter: e.target.value}
                              }
                            });
                            setUnsavedChanges(true);
                          }}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <FileInput
                  label="Couple Image"
                  value={aboutForm.coupleImage}
                  onChange={(file) => {
                    setAboutForm({...aboutForm, coupleImage: file || ''});
                    setUnsavedChanges(true);
                  }}
                  previewKey="coupleImage"
                  description="Upload a photo of the couple together"
                />
              </CardContent>
            </Card>

            {/* Invitation Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Invitation Section</CardTitle>
                  <Button 
                    onClick={handleSaveInvitation} 
                    disabled={sectionLoading.invitation}
                    size="sm"
                  >
                    {sectionLoading.invitation ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Invitation
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="inviteHeading">Heading</Label>
                    <Input 
                      id="inviteHeading"
                      value={invitationForm.heading}
                      onChange={(e) => {
                        setInvitationForm({...invitationForm, heading: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      placeholder="You're Invited!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteSubheading">Subheading</Label>
                    <Input 
                      id="inviteSubheading"
                      value={invitationForm.subheading}
                      onChange={(e) => {
                        setInvitationForm({...invitationForm, subheading: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      placeholder="Join us for our special day"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteMessage">Invitation Message</Label>
                  <Textarea 
                    id="inviteMessage"
                    value={invitationForm.message}
                    onChange={(e) => {
                      setInvitationForm({...invitationForm, message: e.target.value});
                      setUnsavedChanges(true);
                    }}
                    rows={4}
                    placeholder="Write your invitation message here..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rsvpLink">RSVP Link (Optional)</Label>
                    <Input 
                      id="rsvpLink"
                      value={invitationForm.rsvpLink || ''}
                      onChange={(e) => {
                        setInvitationForm({...invitationForm, rsvpLink: e.target.value});
                        setUnsavedChanges(true);
                      }}
                      placeholder="https://your-rsvp-link.com"
                    />
                  </div>
                  <FileInput
                    label="Background Image"
                    value={invitationForm.backgroundImage || ''}
                    onChange={(file) => {
                      setInvitationForm({...invitationForm, backgroundImage: file || ''});
                      setUnsavedChanges(true);
                    }}
                    previewKey="inviteBackground"
                    description="Upload a background image for the invitation"
                  />
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
                <div className="flex gap-2">
                  <Button onClick={addWeddingEvent} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                  <Button 
                    onClick={handleSaveEvents} 
                    disabled={sectionLoading.events}
                    size="sm"
                  >
                    {sectionLoading.events ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save All Events
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {eventsForm.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No events added yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your wedding events to let guests know when and where to celebrate with you.
                  </p>
                  <Button onClick={addWeddingEvent}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Event
                  </Button>
                </div>
              ) : (
                eventsForm.map((event, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Event {index + 1}</CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeWeddingEvent(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`eventTitle${index}`}>Event Title</Label>
                          <Input 
                            id={`eventTitle${index}`}
                            value={event.title}
                            onChange={(e) => {
                              const newEvents = [...eventsForm];
                              newEvents[index].title = e.target.value;
                              setEventsForm(newEvents);
                              setUnsavedChanges(true);
                            }}
                            placeholder="e.g., Ceremony, Reception, Cocktail Hour"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`eventVenue${index}`}>Venue</Label>
                          <Select onValueChange={(value) => {
                            const newEvents = [...eventsForm];
                            newEvents[index].venue = value;
                            setEventsForm(newEvents);
                            setUnsavedChanges(true);
                          }}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select venue" />
                            </SelectTrigger>
                            <SelectContent>
                              {hotels.map((hotel) => (
                                <SelectItem key={hotel.id} value={hotel.id} className="cursor-pointer">
                                  {hotel.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select> 
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
                              setUnsavedChanges(true);
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
                              setUnsavedChanges(true);
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
                            setUnsavedChanges(true);
                          }}
                          rows={3}
                          placeholder="Provide details about this event..."
                        />
                      </div>
                      <FileInput
                        label="Event Image"
                        value={event.image || ''}
                        onChange={(file) => {
                          const newEvents = [...eventsForm];
                          newEvents[index].image = file || '';
                          setEventsForm(newEvents);
                          setUnsavedChanges(true);
                        }}
                        previewKey={`eventImage${index}`}
                        description="Upload an image for this event"
                      />
                    </CardContent>
                  </Card>
                ))
              )}
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
                  <div className="flex gap-2">
                    <Button onClick={addLoveStoryEvent} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                    <Button 
                      onClick={handleSaveLoveStory} 
                      disabled={sectionLoading.loveStory}
                      size="sm"
                    >
                      {sectionLoading.loveStory ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Love Story
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loveStoryForm.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Share your love story</h3>
                    <p className="text-muted-foreground mb-4">
                      Add important milestones in your relationship to create a beautiful timeline.
                    </p>
                    <Button onClick={addLoveStoryEvent}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Milestone
                    </Button>
                  </div>
                ) : (
                  loveStoryForm.map((event, index) => (
                    <Card key={index} className="border-l-4 border-l-pink-500">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Heart className="w-5 h-5 text-pink-500" />
                            Milestone {index + 1}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeLoveStoryEvent(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`storyDate${index}`}>Date</Label>
                            <Input 
                              id={`storyDate${index}`}
                              value={event.date}
                              onChange={(e) => {
                                const newStory = [...loveStoryForm];
                                newStory[index].date = e.target.value;
                                setLoveStoryForm(newStory);
                                setUnsavedChanges(true);
                              }}
                              placeholder="e.g., March 2020, Summer 2019"
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
                                setUnsavedChanges(true);
                              }}
                              placeholder="e.g., First Meeting, Proposal, Moving In Together"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`storyDescription${index}`}>Story</Label>
                          <Textarea 
                            id={`storyDescription${index}`}
                            value={event.description}
                            onChange={(e) => {
                              const newStory = [...loveStoryForm];
                              newStory[index].description = e.target.value;
                              setLoveStoryForm(newStory);
                              setUnsavedChanges(true);
                            }}
                            rows={4}
                            placeholder="Tell the story of this special moment..."
                          />
                        </div>
                        <FileInput
                          label="Memory Photo"
                          value={event.image || ''}
                          onChange={(file) => {
                            const newStory = [...loveStoryForm];
                            newStory[index].image = file || '';
                            setLoveStoryForm(newStory);
                            setUnsavedChanges(true);
                          }}
                          previewKey={`storyImage${index}`}
                          description="Upload a photo from this moment"
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Wedding Planning */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Wedding Planning Checklist</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={addPlanningItem} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                    <Button 
                      onClick={handleSavePlanning} 
                      disabled={sectionLoading.planning}
                      size="sm"
                    >
                      {sectionLoading.planning ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Planning
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {planningForm.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Start your planning checklist</h3>
                    <p className="text-muted-foreground mb-4">
                      Keep track of your wedding planning tasks and share your progress with guests.
                    </p>
                    <Button onClick={addPlanningItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Task
                    </Button>
                  </div>
                ) : (
                  planningForm.map((item, index) => (
                    <Card key={index} className={`border-l-4 ${item.completed ? 'border-l-green-500 bg-green-50/50' : 'border-l-orange-500'}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              id={`planningCompleted${index}`}
                              checked={item.completed}
                              onChange={(e) => {
                                const newPlanning = [...planningForm];
                                newPlanning[index].completed = e.target.checked;
                                setPlanningForm(newPlanning);
                                setUnsavedChanges(true);
                              }}
                              className="w-5 h-5 rounded border-2"
                            />
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`planningTitle${index}`}>Task Title</Label>
                                  <Input 
                                    id={`planningTitle${index}`}
                                    value={item.title}
                                    onChange={(e) => {
                                      const newPlanning = [...planningForm];
                                      newPlanning[index].title = e.target.value;
                                      setPlanningForm(newPlanning);
                                      setUnsavedChanges(true);
                                    }}
                                    placeholder="e.g., Book venue, Order flowers"
                                    className={item.completed ? 'line-through text-muted-foreground' : ''}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`planningIcon${index}`}>Icon (optional)</Label>
                                  <Input 
                                    id={`planningIcon${index}`}
                                    value={item.icon || ''}
                                    onChange={(e) => {
                                      const newPlanning = [...planningForm];
                                      newPlanning[index].icon = e.target.value;
                                      setPlanningForm(newPlanning);
                                      setUnsavedChanges(true);
                                    }}
                                    placeholder="e.g., 🏰, 💐, 🎂"
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
                                    setUnsavedChanges(true);
                                  }}
                                  rows={2}
                                  placeholder="Add details about this task..."
                                  className={item.completed ? 'line-through text-muted-foreground' : ''}
                                />
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removePlanningItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RSVP Tab */}
        <TabsContent value="rsvp">
          <div className="space-y-6">
            {/* RSVP Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {rsvpResponses?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Responses</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {attendingCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Attending</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {notAttendingCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Not Attending</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {totalGuests}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Guests</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RSVP Responses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Guest Responses
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {rsvpResponses?.filter(r => r.status === 'pending').length || 0} pending
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(fetchRSVPResponses(auth?.data?.roleId || ''))}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {rsvpResponses && rsvpResponses.length > 0 ? (
                      rsvpResponses.map((response) => (
                        <Card
                          key={response.id}
                          className={`transition-all hover:shadow-md ${
                            response.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : ''
                          }`}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                      response.attending ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <div>
                                      <h3 className="font-semibold text-lg">{response.name}</h3>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {response.email}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={
                                      response.status === 'confirmed' 
                                        ? 'default'
                                        : response.status === 'declined'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                  >
                                    {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  {response.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span>{response.phone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span>{response.numberOfGuests} guest{response.numberOfGuests !== 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${
                                      response.attending ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {response.attending ? '✓ Attending' : '✗ Not Attending'}
                                    </span>
                                  </div>
                                </div>

                                {response.message && (
                                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border-l-4 border-l-primary">
                                    <div className="text-sm text-muted-foreground mb-1">Message from guest:</div>
                                    <p className="text-sm italic">"{response.message}"</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 ml-6">
                                <Button
                                  size="sm"
                                  variant={response.status === 'confirmed' ? 'default' : 'outline'}
                                  onClick={() => handleRSVPStatusUpdate(response.id, 'confirmed')}
                                  disabled={response.status === 'confirmed'}
                                  className="min-w-[100px]"
                                >
                                  {response.status === 'confirmed' ? (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                  ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                  )}
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant={response.status === 'declined' ? 'destructive' : 'outline'}
                                  onClick={() => handleRSVPStatusUpdate(response.id, 'declined')}
                                  disabled={response.status === 'declined'}
                                  className="min-w-[100px]"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <Users className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                        <h3 className="text-xl font-medium text-muted-foreground mb-3">
                          No RSVP responses yet
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Share your wedding invitation link with your guests to start receiving RSVP responses. 
                          They'll be able to let you know if they're attending and how many guests they're bringing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button onClick={copyInviteLink} variant="outline">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Invite Link
                          </Button>
                          <Button asChild>
                            <Link href={`/invite/${auth?.data?.roleId}`} target="_blank">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Preview Your Invite
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Export Options */}
            {rsvpResponses && rsvpResponses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Export Guest List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," + 
                        "Name,Email,Phone,Guests,Attending,Status,Message,Date\n" +
                        rsvpResponses.map(r => 
                          `"${r.name}","${r.email}","${r.phone || ''}","${r.numberOfGuests}","${r.attending ? 'Yes' : 'No'}","${r.status}","${r.message || ''}","${new Date(r.createdAt).toLocaleDateString()}"`
                        ).join("\n");
                      
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "wedding_guest_list.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success("Guest list exported to CSV");
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Export to CSV
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const printContent = `
                        <html>
                          <head><title>Wedding Guest List</title></head>
                          <body>
                            <h1>Wedding Guest List</h1>
                            <p>Total Responses: ${rsvpResponses.length}</p>
                            <p>Attending: ${attendingCount}</p>
                            <p>Not Attending: ${notAttendingCount}</p>
                            <p>Total Guests: ${totalGuests}</p>
                            <hr>
                            ${rsvpResponses.map(r => `
                              <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc;">
                                <h3>${r.name}</h3>
                                <p>Email: ${r.email}</p>
                                ${r.phone ? `<p>Phone: ${r.phone}</p>` : ''}
                                <p>Guests: ${r.numberOfGuests}</p>
                                <p>Attending: ${r.attending ? 'Yes' : 'No'}</p>
                                <p>Status: ${r.status}</p>
                                ${r.message ? `<p>Message: "${r.message}"</p>` : ''}
                                <p>Date: ${new Date(r.createdAt).toLocaleDateString()}</p>
                              </div>
                            `).join('')}
                          </body>
                        </html>
                      `;
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(printContent);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Print List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Fixed bottom bar for unsaved changes */}
      {unsavedChanges && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setUnsavedChanges(false)}>
                Discard
              </Button>
              <Button size="sm" onClick={() => {
                // Save current tab's data
                switch (activeTab) {
                  case 'profile':
                    handleSaveProfile();
                    break;
                  case 'theme':
                    handleSaveTheme();
                    break;
                  case 'content':
                    handleSaveAbout();
                    break;
                  case 'events':
                    handleSaveEvents();
                    break;
                  case 'story':
                    handleSaveLoveStory();
                    break;
                  default:
                    setUnsavedChanges(false);
                }
              }}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}