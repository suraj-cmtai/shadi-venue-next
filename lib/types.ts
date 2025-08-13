export interface Theme {
  titleColor: string;
  nameColor: string;
  buttonColor: string;
  buttonHoverColor: string;
}

export interface InviteBase {
  isEnabled: boolean;
  status: 'draft' | 'published';
  theme?: Theme;
  weddingData?: {
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
    events: {
      title: string;
      date: string;
      time: string;
      venue: string;
    }[];
  };
}

export interface InviteStats {
  views?: number;
  rsvpCount?: number;
  lastPublished?: string;
}

export type Invite = InviteBase & InviteStats;

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type UserRole = 'user' | 'admin' | 'hotel' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  address?: Address;
  avatar?: string;
  invite?: Invite;
  notifications: Notification[];
}
