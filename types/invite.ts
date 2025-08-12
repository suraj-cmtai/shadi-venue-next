import { WeddingState } from '@/lib/redux/features/inviteSlice';

export type Theme = {
  titleColor: string;
  nameColor: string;
  buttonColor: string;
  buttonHoverColor: string;
};

export type Invite = WeddingState & {
  isEnabled: boolean;
};
