import { DailyWord, User, Post, Badge } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: '김은혜',
  avatar: 'https://picsum.photos/100/100',
  type: 'Morning',
  streak: 14,
  group: '청년 1부',
  level: 3,
  currentExp: 340,
  maxExp: 500
};

export const TODAY_WORD: DailyWord = {
  date: '2024년 5월 20일',
  reference: '시편 23:1-6',
  title: '여호와는 나의 목자시니',
  text: '여호와는 나의 목자시니 내게 부족함이 없으리로다. 그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다. 내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다.',
  keyVerse: '내 평생에 선하심과 인자하심이 반드시 나를 따르리니 내가 여호와의 집에 영원히 살리로다 (시 23:6)'
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user: {
      id: 'u2',
      name: '이믿음',
      avatar: 'https://picsum.photos/101/101',
      type: 'Night',
      streak: 5,
      group: '청년 2부',
      level: 2,
      currentExp: 120,
      maxExp: 300
    },
    content: '오늘 말씀을 묵상하며 참된 쉼이 무엇인지 생각하게 되었습니다. 바쁜 일상 속에서도 주님이 주시는 평안을 놓치지 않기를 기도합니다.',
    scriptureRef: '시편 23:1-6',
    imageUrl: 'https://picsum.photos/800/600',
    amenCount: 24,
    commentCount: 5,
    timestamp: '2시간 전',
    tags: ['#평안', '#인도하심', '#감사']
  },
  {
    id: 'p2',
    user: {
      id: 'u3',
      name: '박사랑',
      avatar: 'https://picsum.photos/102/102',
      type: 'Morning',
      streak: 42,
      group: '청년 1부',
      level: 5,
      currentExp: 450,
      maxExp: 800
    },
    content: '부족함이 없으리로다 고백하지만 여전히 현실의 결핍에 집중하는 저를 봅니다. 오늘 하루는 이미 주신 것에 감사하는 연습을 하려고 합니다.',
    scriptureRef: '시편 23:1',
    amenCount: 56,
    commentCount: 12,
    timestamp: '4시간 전',
    tags: ['#감사', '#만족']
  },
  {
    id: 'p3',
    user: CURRENT_USER, // Self post
    content: '아침 일찍 일어나 말씀을 보니 하루가 다릅니다! 사망의 음침한 골짜기 같았던 어제였지만, 오늘은 주님의 지팡이가 느껴집니다.',
    scriptureRef: '시편 23:4',
    amenCount: 12,
    commentCount: 2,
    timestamp: '방금 전',
    tags: ['#새벽큐티', '#승리']
  }
];

export const BADGES: Badge[] = [
  {
    id: 'b1',
    name: '작심삼일 탈출',
    description: '3일 연속 큐티 인증',
    icon: '🌱',
    acquired: true,
    dateAcquired: '2024-03-10'
  },
  {
    id: 'b2',
    name: '일주일의 기적',
    description: '7일 연속 큐티 인증',
    icon: '🔥',
    acquired: true,
    dateAcquired: '2024-03-17'
  },
  {
    id: 'b3',
    name: '새벽이슬',
    description: '오전 6시 이전 인증 10회',
    icon: '🌅',
    acquired: false
  },
  {
    id: 'b4',
    name: '묵상의 고수',
    description: '총 100회 인증 달성',
    icon: '👑',
    acquired: false
  }
];