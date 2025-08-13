'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { notFound, useRouter } from 'next/navigation';
import { fetchUserById } from '@/lib/redux/features/userSlice';
import HomeHero from '../components/homeHero';
import AboutPage from '../components/about';
import WeddingDay from '../components/wedding-day';
import LoveStory from '../components/love-story';
import Planning from '../components/planning';
import Invitation from '../components/invitation';
import WeddingFooter from '../components/wed-footer';

interface InvitePageProps {
  params: Promise<{
    userId: string;
  }>;
}

const InvitePage = ({ params }: InvitePageProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.selectedUser);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);
  const router = useRouter();

  // Always declare all state at the top level
  const [userId, setUserId] = useState<string>('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const resolvedParams = await params;
        const { userId: paramUserId } = resolvedParams;
        setUserId(paramUserId);
        dispatch(fetchUserById(paramUserId));
      } catch (error) {
        console.error('Error resolving params:', error);
        setShouldRedirect(true);
      }
    };

    getUserId();
  }, [dispatch, params]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user?.invite?.isEnabled) {
    return notFound();
  }

  useEffect(() => {
    if (user !== null && (!user.invite?.isEnabled)) {
      setShouldRedirect(true);
    }
  }, [user]);

  useEffect(() => {
    if (shouldRedirect) {
      notFound();
    }
  }, [shouldRedirect]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading wedding invitation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!user || !user.invite?.isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Wedding invitation not available</div>
      </div>
    );
  }

  const { theme, about, weddingEvents, loveStory, planning, invitation } = user.invite;

  const extendedTheme = {
    ...theme,
    titleColor: theme.titleColor || theme.primaryColor,
    nameColor: theme.nameColor || theme.secondaryColor,
    buttonColor: theme.primaryColor,
    buttonHoverColor: theme.secondaryColor,
  };

  return (
    <section className="bg-black text-white">
      <HomeHero
        title={invitation.heading}
        subtitle={invitation.subheading}
        background={invitation.backgroundImage || '/images/default-wedding-bg.jpg'}
        theme={extendedTheme}
      />
      <AboutPage
        title={about.title}
        subtitle={about.subtitle}
        groom={about.groom}
        bride={about.bride}
        coupleImage={about.coupleImage}
        theme={extendedTheme}
      />
      {weddingEvents.map((event, index) => (
        <WeddingDay
          key={index}
          title={event.title}
          date={event.date}
          time={event.time}
          venue={event.venue}
          address={event.description}
          mapUrl=""
          images={[event.image || '/images/default-event.jpg']}
          theme={extendedTheme}
        />
      ))}
      <LoveStory
        title="Our Love Story"
        subtitle="How we met and fell in love"
        stories={loveStory.map((story, index) => ({
          id: index + 1,
          title: story.title,
          date: story.date,
          description: story.description,
          image: story.image || '/images/default-story.jpg'
        }))}
        theme={extendedTheme}
      />
      <Planning
        title="Wedding Planning"
        subtitle="Our journey to the big day"
        events={planning.map((item, index) => ({
          id: index + 1,
          type: 'event',
          date: new Date().toISOString(),
          venue: item.description || '',
          time: '12:00 PM',
          phone: '',
          icon: item.icon || '/images/default-event-icon.svg'
        }))}
        mapIframeUrl=""
        theme={extendedTheme}
      />
      <Invitation 
        userId={userId}
      />
      <WeddingFooter 
        backgroundImage={invitation.backgroundImage || '/images/default-footer-bg.jpg'}
        coupleNames={`${about.groom.name} & ${about.bride.name}`}
        subtitle={invitation.subheading}
        socials={{
          instagram: about.groom.socials.instagram || about.bride.socials.instagram || '#',
          twitter: about.groom.socials.twitter || about.bride.socials.twitter || '#',
          facebook: about.groom.socials.facebook || about.bride.socials.facebook || '#'
        }}
      />
    </section>
  );
};

export default InvitePage;