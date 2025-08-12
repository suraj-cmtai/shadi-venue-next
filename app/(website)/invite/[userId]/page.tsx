'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import { fetchUserById } from '@/lib/redux/features/userSlice';
import { WeddingState } from '@/lib/redux/features/inviteSlice';
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

interface InviteData extends WeddingState {
  isEnabled: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  invite?: InviteData;
}

const InvitePage = ({ params }: InvitePageProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.selectedUser) as User | null;
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);
  const router = useRouter();

  useEffect(() => {
    const getUserId = async () => {
      const { userId } = await params;
      dispatch(fetchUserById(userId));
    };

    getUserId();
  }, [dispatch, params]);

  useEffect(() => {
    if (user && !user.invite?.isEnabled) {
      router.push('/404');
    }
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user || !user.invite?.isEnabled) {
    return null;
  }

  // We need to extract userId for the Invitation component
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const extractUserId = async () => {
      const { userId } = await params;
      setUserId(userId);
    };

    extractUserId();
  }, [params]);

  return (
    <section className="bg-black text-white">
      <HomeHero
        title={user.invite.invite.title}
        subtitle={user.invite.invite.names}
        background={user.invite.invite.leftImage}
        theme={user.invite.theme}
      />
      <AboutPage
        title={user.invite.about.title}
        subtitle={user.invite.about.subtitle}
        groom={user.invite.about.groom}
        bride={user.invite.about.bride}
        coupleImage={user.invite.about.coupleImage}
        theme={user.invite.theme}
      />
      <WeddingDay
        title={user.invite.weddingDay.headingMain}
        date={user.invite.weddingDay.date}
        time=""  // This should come from backend
        venue={user.invite.weddingDay.headingTop}
        address={user.invite.weddingDay.headingMain}
        mapUrl=""  // This should come from backend
        images={user.invite.weddingDay.images}
        theme={user.invite.theme}
      />
      <LoveStory
        title={user.invite.loveStory.sectionTitle}
        subtitle={user.invite.loveStory.sectionSubtitle}
        stories={user.invite.loveStory.stories}
        theme={user.invite.theme}
      />
      <Planning
        title={user.invite.planning.title}
        subtitle={user.invite.planning.subtitle}
        events={user.invite.planning.events}
        mapIframeUrl={user.invite.planning.mapIframeUrl}
        theme={user.invite.theme}
      />
      {userId && (
        <Invitation 
          userId={userId}
        />
      )}
      <WeddingFooter 
        backgroundImage={user.invite.footer.backgroundImage}
        coupleNames={user.invite.footer.coupleNames}
        subtitle={user.invite.footer.subtitle}
        socials={user.invite.footer.socials}
      />
    </section>
  );
};

export default InvitePage;