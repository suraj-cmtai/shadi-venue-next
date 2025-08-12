'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Image, Palette, Share2, Type, Users, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

import { AppDispatch } from '@/lib/redux/store';
import { selectAuth } from '@/lib/redux/features/authSlice';
import { selectSelectedUser, fetchUserById, updateUser } from '@/lib/redux/features/userSlice';
import { fetchRSVPResponses, selectRSVPResponses, updateRSVPStatus } from '@/lib/redux/features/rsvpSlice';
import {
  setTheme,
  setInviteData,
  setAboutData,
  setWeddingDay,
  setLoveStory,
  setPlanning,
  setRSVP,
  setFooter,
} from '@/lib/redux/features/inviteSlice';

interface User {
  id: string;
  name: string;
  email: string;
  invite?: WeddingState;
}

interface RSVPResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  attending: boolean;
  numberOfGuests: number;
  message?: string;
  status: 'confirmed' | 'declined';
  createdAt: string;
  updatedAt: string;
}

interface SocialLinks {
    instagram: string;
    facebook: string;
    twitter?: string;
}

interface LoveStoryItem {
    id: number;
    date: string;
    title: string;
    description: string;
    image: string;
}

interface EventItem {
    id: number;
    type: string;
    date: string;
    venue: string;
    time: string;
    phone: string;
    icon: string;
}

interface PlanningSection {
    mapIframeUrl: string;
    title: string;
    subtitle: string;
    events: EventItem[];
}

interface WeddingState {
    theme: {
        titleColor: string;
        nameColor: string;
        buttonColor: string;
        buttonHoverColor: string;
    };
    invite: {
        leftImage: string;
        rightImage: string;
        title: string;
        names: string;
        linkHref: string;
        linkText: string;
    };
    about: {
        subtitle: string;
        title: string;
        groom: {
            name: string;
            description: string;
            image: string;
            socials: SocialLinks;
        };
        bride: {
            name: string;
            description: string;
            image: string;
            socials: SocialLinks;
        };
        coupleImage: string;
    };
    weddingDay: {
        backgroundColor: string;
        headingTop: string;
        headingMain: string;
        date: string;
        images: string[];
    };
    loveStory: {
        sectionTitle: string;
        sectionSubtitle: string;
        stories: LoveStoryItem[];
    };
    planning: PlanningSection;
    rsvp: {
        backgroundImage: string;
    };
    footer: {
        backgroundImage: string;
        coupleNames: string;
        subtitle: string;
        socials: {
            instagram: string;
            twitter: string;
            facebook: string;
        };
    };
}

export default function UserDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectSelectedUser);
  const rsvpResponses = useSelector(selectRSVPResponses);
  const [activeTab, setActiveTab] = useState('theme');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (auth?.id) {
      dispatch(fetchUserById(auth.id));
      dispatch(fetchRSVPResponses(auth.id));
    }
  }, [dispatch, auth?.id]);

  const handleInviteUpdate = async (
    section: keyof WeddingState,
    data: Partial<WeddingState[keyof WeddingState]>
  ) => {
    setIsSaving(true);
    try {
      // Dispatch the appropriate action based on the section
      const action = {
        theme: setTheme,
        invite: setInviteData,
        about: setAboutData,
        weddingDay: setWeddingDay,
        loveStory: setLoveStory,
        planning: setPlanning,
        rsvp: setRSVP,
        footer: setFooter,
      }[section];

      if (action) {
        await dispatch(action(data));
        const formData = new FormData();
        formData.append('invite', JSON.stringify({ [section]: data }));
        await dispatch(updateUser({ 
          id: auth!.id, 
          data: formData
        })).unwrap();
      }
      toast.success("Saved changes");
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRSVPStatusUpdate = async (rsvpId: string, status: 'confirmed' | 'declined') => {
    try {
      await dispatch(updateRSVPStatus({ 
        rsvpId, 
        userId: auth!.id, 
        status 
      })).unwrap();
      toast.success(`RSVP ${status}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update RSVP status");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
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
            <Link href={`/invite/${auth?.id}`} target="_blank">
              <Share2 className="w-4 h-4 mr-2" />
              Preview Invite
            </Link>
          </Button>
          {isSaving && <p className="text-sm text-muted-foreground">Saving...</p>}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" />
            Theme & Style
          </TabsTrigger>
          <TabsTrigger value="content">
            <Type className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="w-4 h-4 mr-2" />
            Media
          </TabsTrigger>
          <TabsTrigger value="rsvp">
            <Users className="w-4 h-4 mr-2" />
            RSVP Responses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Title Color</Label>
                  <Input 
                    type="color" 
                    value={user.invite?.theme?.titleColor}
                    onChange={(e) => handleInviteUpdate('theme', { titleColor: e.target.value })}
                  />
                </div>
                {/* Add other theme settings */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Couple Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Couple Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Groom's Name</Label>
                    <Input 
                      value={user.invite?.about?.groom?.name}
                      onChange={(e) => handleInviteUpdate('about', {
                        groom: {
                          name: e.target.value,
                          description: user.invite?.about?.groom?.description || '',
                          image: user.invite?.about?.groom?.image || '',
                          socials: {
                            instagram: user.invite?.about?.groom?.socials?.instagram || '',
                            facebook: user.invite?.about?.groom?.socials?.facebook || ''
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bride's Name</Label>
                    <Input 
                      value={user.invite?.about?.bride?.name}
                      onChange={(e) => handleInviteUpdate('about', {
                        bride: {
                          name: e.target.value,
                          description: user.invite?.about?.bride?.description || '',
                          image: user.invite?.about?.bride?.image || '',
                          socials: {
                            instagram: user.invite?.about?.bride?.socials?.instagram || '',
                            facebook: user.invite?.about?.bride?.socials?.facebook || ''
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
              {/* Add other content sections */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Image upload and management section */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsvp">
          <Card>
            <CardHeader>
              <CardTitle>RSVP Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {rsvpResponses.map((response) => (
                    <div
                      key={response.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{response.name}</p>
                        <p className="text-sm text-gray-500">{response.email}</p>
                        <p className="text-sm">
                          Guests: {response.numberOfGuests} • {response.attending ? 'Attending' : 'Not Attending'}
                        </p>
                        {response.message && (
                          <p className="text-sm mt-2 italic">"{response.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={response.status === 'confirmed' ? 'default' : 'outline'}
                          onClick={() => handleRSVPStatusUpdate(response.id, 'confirmed')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant={response.status === 'declined' ? 'destructive' : 'outline'}
                          onClick={() => handleRSVPStatusUpdate(response.id, 'declined')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
