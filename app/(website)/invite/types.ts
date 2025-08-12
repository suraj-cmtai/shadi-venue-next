export type Theme = {
  titleColor: string;
  nameColor: string;
  buttonColor: string;
  buttonHoverColor: string;
};

export interface SocialLinks {
  instagram: string;
  facebook: string;
  twitter?: string;
}

export interface Person {
  name: string;
  description: string;
  image: string;
  socials: SocialLinks;
}

export interface LoveStoryItem {
  id: number;
  date: string;
  title: string;
  description: string;
  image: string;
}

export interface EventItem {
  id: number;
  type: string;
  date: string;
  venue: string;
  time: string;
  phone: string;
  icon: string;
}

export interface PlanningSection {
  mapIframeUrl: string;
  title: string;
  subtitle: string;
  events: EventItem[];
}

export type Invite = {
  isEnabled: boolean;
  theme: Theme;
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
    groom: Person;
    bride: Person;
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
    socials: SocialLinks;
  };
};
