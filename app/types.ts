/** ERD oq_users 테이블 기준 회원가입/회원 정보 */
export interface OqUser {
  id?: number;
  user_name: string;
  guk_no: number;
  birth_date: string; // YYYY-MM-DD
  leader_name: string;
  enneagram_type: string;
  reg_date?: string;
  update_date?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  type: 'Morning' | 'Night' | 'Lunch' | 'Anytime';
  streak: number;
  group: string;
  level: number;      // Added
  currentExp: number; // Added
  maxExp: number;     // Added
}

export interface Post {
  id: string;
  user: User;
  content: string;
  scriptureRef: string;
  imageUrl?: string;
  isAnonymous?: boolean;
  amenCount: number;
  commentCount: number;
  timestamp: string;
  tags: string[];
}

export interface DailyWord {
  date: string;
  reference: string;
  title: string;
  text: string;
  keyVerse: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  acquired: boolean;
  dateAcquired?: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}

export enum FeedFilter {
  ALL = 'ALL',
  MY_TYPE = 'MY_TYPE',
  FOLLOWING = 'FOLLOWING'
}