import { Badge, DailyWord, Post, User } from "./types";

/** demo 페이지 전용 목데이터 — 실제 서비스에서 사용 금지 */
export const TODAY_WORD: DailyWord = {
  date: "2024년 5월 20일",
  reference: "시편 23:1-6",
  title: "여호와는 나의 목자시니",
  text: "여호와는 나의 목자시니 내게 부족함이 없으리로다. 그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다. 내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다.",
  keyVerse:
    "내 평생에 선하심과 인자하심이 반드시 나를 따르리니 내가 여호와의 집에 영원히 살리로다 (시 23:6)",
};

export const CURRENT_USER: User = {
  id: "u1",
  name: "김은혜",
  avatar: "https://picsum.photos/100/100",
  type: "Morning",
  streak: 14,
  group: "청년 1부",
  level: 3,
  currentExp: 340,
  maxExp: 500,
};


export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    user: {
      id: "u2",
      name: "이믿음",
      avatar: "https://picsum.photos/101/101",
      type: "Night",
      streak: 5,
      group: "청년 2부",
      level: 2,
      currentExp: 120,
      maxExp: 300,
    },
    content:
      "오늘 말씀을 묵상하며 참된 쉼이 무엇인지 생각하게 되었습니다. 바쁜 일상 속에서도 주님이 주시는 평안을 놓치지 않기를 기도합니다.",
    scriptureRef: "시편 23:1-6",
    imageUrl: "https://picsum.photos/800/600",
    amenCount: 24,
    commentCount: 5,
    isLiked: false,
    timestamp: "2026-02-15T11:30:00Z",
    tags: ["#평안", "#인도하심", "#감사"],
  },
  {
    id: "p2",
    user: {
      id: "u3",
      name: "박사랑",
      avatar: "https://picsum.photos/102/102",
      type: "Morning",
      streak: 42,
      group: "청년 1부",
      level: 5,
      currentExp: 450,
      maxExp: 800,
    },
    content:
      "부족함이 없으리로다 고백하지만 여전히 현실의 결핍에 집중하는 저를 봅니다. 오늘 하루는 이미 주신 것에 감사하는 연습을 하려고 합니다.",
    scriptureRef: "시편 23:1",
    amenCount: 56,
    commentCount: 12,
    isLiked: false,
    timestamp: "2026-02-15T09:30:00Z",
    tags: ["#감사", "#만족"],
  },
  {
    id: "p3",
    user: CURRENT_USER,
    content:
      "아침 일찍 일어나 말씀을 보니 하루가 다릅니다! 사망의 음침한 골짜기 같았던 어제였지만, 오늘은 주님의 지팡이가 느껴집니다.",
    scriptureRef: "시편 23:4",
    amenCount: 12,
    commentCount: 2,
    isLiked: false,
    timestamp: "2026-02-15T13:28:00Z",
    tags: ["#새벽큐티", "#승리"],
  },
];

/** 마이페이지용: 내가 과거에 작성한 큐티 묵상 목록 (인스타그램 피드처럼 아래로 쭉) */
export const MOCK_MY_POSTS: Post[] = [
  {
    id: "my1",
    user: CURRENT_USER,
    content:
      "아침 일찍 일어나 말씀을 보니 하루가 다릅니다! 사망의 음침한 골짜기 같았던 어제였지만, 오늘은 주님의 지팡이가 느껴집니다.",
    scriptureRef: "시편 23:4",
    amenCount: 12,
    commentCount: 2,
    isLiked: false,
    timestamp: "2026-02-15T13:28:00Z",
    tags: ["#새벽큐티", "#승리"],
  },
  {
    id: "my2",
    user: CURRENT_USER,
    content:
      "하나님이 세상을 이처럼 사랑하사... 오늘 나도 그 사랑 안에 머물기를. 주변 사람들에게 작은 사랑을 나누는 하루가 되길.",
    scriptureRef: "요한복음 3:16",
    imageUrl: "https://picsum.photos/800/500",
    amenCount: 8,
    commentCount: 3,
    isLiked: false,
    timestamp: "2026-02-14T13:30:00Z",
    tags: ["#사랑", "#구원"],
  },
  {
    id: "my3",
    user: CURRENT_USER,
    content:
      "여호와는 나의 목자시니 부족함이 없으리로다. 오늘 하루도 주님 인도하심을 믿고 걸었습니다.",
    scriptureRef: "시편 23:1",
    amenCount: 5,
    commentCount: 1,
    isLiked: false,
    timestamp: "2026-02-13T13:30:00Z",
    tags: ["#평안", "#인도"],
  },
  {
    id: "my4",
    user: CURRENT_USER,
    content:
      "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라. 어제보다 한 걸음 더 내딛는 하루.",
    scriptureRef: "빌립보 4:13",
    amenCount: 15,
    commentCount: 4,
    isLiked: false,
    timestamp: "2026-02-12T13:30:00Z",
    tags: ["#능력", "#희망"],
  },
  {
    id: "my5",
    user: CURRENT_USER,
    content:
      "마음을 다하여 여호와를 신뢰하고... 오늘도 주님 뜻을 먼저 구하는 하루가 되길.",
    scriptureRef: "잠언 3:5-6",
    amenCount: 7,
    commentCount: 0,
    isLiked: false,
    timestamp: "2026-02-10T13:30:00Z",
    tags: ["#신뢰", "#인도"],
  },
];

export const BADGES: Badge[] = [
  {
    id: "b1",
    name: "작심삼일 탈출",
    description: "3일 연속 큐티 인증",
    icon: "🌱",
    acquired: true,
    dateAcquired: "2024-03-10",
  },
  {
    id: "b2",
    name: "일주일의 기적",
    description: "7일 연속 큐티 인증",
    icon: "🔥",
    acquired: true,
    dateAcquired: "2024-03-17",
  },
  {
    id: "b3",
    name: "새벽이슬",
    description: "오전 6시 이전 인증 10회",
    icon: "🌅",
    acquired: false,
  },
  {
    id: "b4",
    name: "묵상의 고수",
    description: "총 100회 인증 달성",
    icon: "👑",
    acquired: false,
  },
];
