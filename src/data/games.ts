export type GameStatus = "Playing" | "Completed" | "Backlog" | "Paused";
type SeedGame = {
  id: string;
  title: string;
  kicker: string;
  year: number;
  platform: string;
  genre: string;
  score: number;
  status: GameStatus;
  playtime: number;
  accent: string;
  cover: string;
  hero: string;
  description: string;
};
const img = (id: string, _w = 1800) =>
  `${import.meta.env.BASE_URL}artwork/${id === "photo-1497436072909-f5e4be1713c0" ? "photo-1464822759023-fed622ff2c3b" : id}.jpg`;
const seedGames: SeedGame[] = [
  {
    id: "bloodborne",
    title: "Bloodborne",
    kicker: "Fear the old blood.",
    year: 2015,
    platform: "PlayStation",
    genre: "Action RPG",
    score: 96,
    status: "Completed" as GameStatus,
    playtime: 118,
    accent: "#7890a5",
    cover: img("photo-1519608487953-e999c86e7455", 700),
    hero: img("photo-1519608487953-e999c86e7455"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "sekiro",
    title: "Sekiro",
    kicker: "Hesitation is defeat.",
    year: 2019,
    platform: "PlayStation",
    genre: "Action",
    score: 95,
    status: "Completed" as GameStatus,
    playtime: 82,
    accent: "#c97647",
    cover: img("photo-1500530855697-b586d89ba3ee", 700),
    hero: img("photo-1500530855697-b586d89ba3ee"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "tlou2",
    title: "The Last of Us Part II",
    kicker: "Every path has a price.",
    year: 2020,
    platform: "PlayStation",
    genre: "Narrative Action",
    score: 94,
    status: "Completed" as GameStatus,
    playtime: 44,
    accent: "#789071",
    cover: img("photo-1441974231531-c6227db76b6e", 700),
    hero: img("photo-1441974231531-c6227db76b6e"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "rdr2",
    title: "Red Dead Redemption 2",
    kicker: "Outlaws for life.",
    year: 2018,
    platform: "PlayStation",
    genre: "Open World",
    score: 98,
    status: "Completed" as GameStatus,
    playtime: 143,
    accent: "#b66b45",
    cover: img("photo-1500534314209-a25ddb2bd429", 700),
    hero: img("photo-1500534314209-a25ddb2bd429"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "godofwar",
    title: "God of War",
    kicker: "A new beginning.",
    year: 2018,
    platform: "PlayStation",
    genre: "Action Adventure",
    score: 95,
    status: "Completed" as GameStatus,
    playtime: 56,
    accent: "#9aa9b8",
    cover: img("photo-1483347756197-71ef80e95f73", 700),
    hero: img("photo-1483347756197-71ef80e95f73"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "uncharted4",
    title: "Uncharted 4",
    kicker: "One last adventure.",
    year: 2016,
    platform: "PlayStation",
    genre: "Adventure",
    score: 93,
    status: "Completed" as GameStatus,
    playtime: 29,
    accent: "#5e91a7",
    cover: img("photo-1464822759023-fed622ff2c3b", 700),
    hero: img("photo-1464822759023-fed622ff2c3b"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "nier",
    title: "NieR: Automata",
    kicker: "Glory to mankind.",
    year: 2017,
    platform: "PlayStation",
    genre: "Action RPG",
    score: 93,
    status: "Completed" as GameStatus,
    playtime: 61,
    accent: "#c5bcaa",
    cover: img("photo-1497436072909-f5e4be1713c0", 700),
    hero: img("photo-1497436072909-f5e4be1713c0"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "monsterhunter",
    title: "Monster Hunter: World",
    kicker: "Welcome to the New World.",
    year: 2018,
    platform: "PlayStation",
    genre: "Action RPG",
    score: 92,
    status: "Completed" as GameStatus,
    playtime: 230,
    accent: "#879b62",
    cover: img("photo-1464278533981-50106e6176b1", 700),
    hero: img("photo-1464278533981-50106e6176b1"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "hollowknight",
    title: "Hollow Knight",
    kicker: "Descend into Hallownest.",
    year: 2017,
    platform: "Indie",
    genre: "Metroidvania",
    score: 96,
    status: "Completed" as GameStatus,
    playtime: 73,
    accent: "#7c8dac",
    cover: img("photo-1511497584788-876760111969", 700),
    hero: img("photo-1511497584788-876760111969"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "inside",
    title: "INSIDE",
    kicker: "Keep moving.",
    year: 2016,
    platform: "Indie",
    genre: "Puzzle",
    score: 91,
    status: "Completed" as GameStatus,
    playtime: 6,
    accent: "#6a6b6d",
    cover: img("photo-1519608487953-e999c86e7455", 700),
    hero: img("photo-1519608487953-e999c86e7455"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "journey",
    title: "Journey",
    kicker: "The mountain is waiting.",
    year: 2012,
    platform: "PlayStation",
    genre: "Adventure",
    score: 94,
    status: "Completed" as GameStatus,
    playtime: 4,
    accent: "#cf9765",
    cover: img("photo-1507525428034-b723cf961d3e", 700),
    hero: img("photo-1507525428034-b723cf961d3e"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "abzu",
    title: "ABZÛ",
    kicker: "A world beneath.",
    year: 2016,
    platform: "Indie",
    genre: "Adventure",
    score: 88,
    status: "Completed" as GameStatus,
    playtime: 5,
    accent: "#58a9b8",
    cover: img("photo-1469474968028-56623f02e42e", 700),
    hero: img("photo-1469474968028-56623f02e42e"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "titanfall2",
    title: "Titanfall 2",
    kicker: "Protocol 3.",
    year: 2016,
    platform: "PlayStation",
    genre: "FPS",
    score: 94,
    status: "Completed" as GameStatus,
    playtime: 17,
    accent: "#7d9bb0",
    cover: img("photo-1517976547714-720226b864c1", 700),
    hero: img("photo-1517976547714-720226b864c1"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "nioh2",
    title: "Nioh 2",
    kicker: "Master the shift.",
    year: 2020,
    platform: "PlayStation",
    genre: "Action RPG",
    score: 91,
    status: "Completed" as GameStatus,
    playtime: 106,
    accent: "#a66f58",
    cover: img("photo-1518005020951-eccb494ad742", 700),
    hero: img("photo-1518005020951-eccb494ad742"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "gta5",
    title: "Grand Theft Auto V",
    kicker: "Los Santos.",
    year: 2013,
    platform: "PlayStation",
    genre: "Open World",
    score: 92,
    status: "Completed" as GameStatus,
    playtime: 81,
    accent: "#7ca285",
    cover: img("photo-1444723121867-7a241cacace9", 700),
    hero: img("photo-1444723121867-7a241cacace9"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "evilwithin",
    title: "The Evil Within",
    kicker: "Survive the nightmare.",
    year: 2014,
    platform: "PlayStation",
    genre: "Survival Horror",
    score: 90,
    status: "Paused" as GameStatus,
    playtime: 19,
    accent: "#8f4f48",
    cover: img("photo-1518709268805-4e9042af9f23", 700),
    hero: img("photo-1518709268805-4e9042af9f23"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "deadcells",
    title: "Dead Cells",
    kicker: "Kill. Die. Learn.",
    year: 2018,
    platform: "Indie",
    genre: "Roguelite",
    score: 90,
    status: "Backlog" as GameStatus,
    playtime: 3,
    accent: "#7e7fd6",
    cover: img("photo-1511512578047-dfb367046420", 700),
    hero: img("photo-1511512578047-dfb367046420"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "hades",
    title: "Hades",
    kicker: "There is no escape.",
    year: 2020,
    platform: "Indie",
    genre: "Roguelite",
    score: 94,
    status: "Backlog" as GameStatus,
    playtime: 2,
    accent: "#d46c4d",
    cover: img("photo-1500534314209-a25ddb2bd429", 700),
    hero: img("photo-1500534314209-a25ddb2bd429"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "limbo",
    title: "LIMBO",
    kicker: "Uncertain of his sister’s fate.",
    year: 2010,
    platform: "Indie",
    genre: "Puzzle",
    score: 89,
    status: "Completed" as GameStatus,
    playtime: 5,
    accent: "#8d8d8d",
    cover: img("photo-1483982258113-b72862e6cff6", 700),
    hero: img("photo-1483982258113-b72862e6cff6"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
  {
    id: "littlenightmares",
    title: "Little Nightmares",
    kicker: "Childhood fears.",
    year: 2017,
    platform: "Indie",
    genre: "Horror Adventure",
    score: 88,
    status: "Backlog" as GameStatus,
    playtime: 1,
    accent: "#c59a52",
    cover: img("photo-1502139214982-d0ad755818d8", 700),
    hero: img("photo-1502139214982-d0ad755818d8"),
    description:
      "A curated memory from the library, presented as an atmospheric placeholder until provider artwork is connected.",
  },
];

export type Game = SeedGame & {
  originalTitle: string;
  favorite: boolean;
  notes: string;
  collections: string[];
  firstPlayedAt: string;
  lastPlayedAt: string;
  completedAt: string;
  screenshots: string[];
  studio: string;
  provider: "local" | "steam" | "rawg" | "igdb";
};
export type PersonalPatch = Partial<
  Pick<
    Game,
    | "favorite"
    | "notes"
    | "collections"
    | "firstPlayedAt"
    | "lastPlayedAt"
    | "completedAt"
    | "score"
    | "playtime"
    | "status"
  >
>;
const stories: Record<string, [string, string]> = {
  bloodborne: [
    "FromSoftware",
    "城市沉睡，噩梦醒来。雅南的每条长街都藏着秘密，而每一场险胜，都会留下自己的印记。",
  ],
  sekiro: [
    "FromSoftware",
    "一把刀，一个承诺，一息之间的抉择。穿行在破碎山河里，也在一次次重来中，学会向前。",
  ],
  tlou2: [
    "Naughty Dog",
    "世界渐渐忘了温柔，仍有人守住片刻安宁。关于想要留住的人，也关于始终无法放下的事。",
  ],
  rdr2: [
    "Rockstar Games",
    "旧西部的最后一抹余晖。长路、旷野与落日，一群亡命之徒，在变迁的时代里寻找归处。",
  ],
  godofwar: [
    "Santa Monica Studio",
    "离开故土的父与子，踏遍诸界。最漫长也最重要的路，是终于走近彼此。",
  ],
  uncharted4: [
    "Naughty Dog",
    "失落的海盗国度，久违的面孔，还有地平线那头的召唤。说是最后一次，却仍舍不得停下。",
  ],
  nier: [
    "PlatinumGames",
    "当我们离去，什么会留下？一场关于存在与人性的追问，由并非人类的生命，缓缓道来。",
  ],
  monsterhunter: [
    "Capcom",
    "循着足迹，走进鲜活的荒野。听懂它的节律，遇见它的巨兽，也找到自己在万物之间的位置。",
  ],
  hollowknight: [
    "Team Cherry",
    "寂静小镇之下，遗忘的王国仍在等待。黑暗里每一点微光，都是继续前行的理由。",
  ],
  inside: [
    "Playdead",
    "一个男孩，一片森林，一个满是疑问的世界。这段无言的旅程，在屏幕熄灭后，仍久久回响。",
  ],
  journey: [
    "thatgamecompany",
    "一座远山，一场无言的相逢。有人同行时，旅途本身，便已值得珍藏。",
  ],
  abzu: [
    "Giant Squid",
    "告别水面，潜入光影流动的海洋。在鱼群与潮汐之间，重新找回对世界的惊奇。",
  ],
  titanfall2: [
    "Respawn Entertainment",
    "边境尽头，一段意想不到的羁绊。有些信任，建立在每一次看似不可能的纵身一跃里。",
  ],
  nioh2: [
    "Team Ninja",
    "在人与妖的边界，写下自己的故事。每一次交锋，都是关于耐心与分寸的修行。",
  ],
  gta5: [
    "Rockstar Games",
    "三段人生，在洛圣都的阳光下交错。野心、荒诞与无尽可能，共同铺开这座城市的底色。",
  ],
  evilwithin: [
    "Tango Gameworks",
    "眼前所见，未必是真。在不肯结束的噩梦里，循着一线微光，寻找归途。",
  ],
  deadcells: [
    "Motion Twin",
    "再试一次，再过一关。每一个新的起点，都藏着比上一次多一点的勇气。",
  ],
  hades: [
    "Supergiant Games",
    "每一次逃离，都在讲述同一个家庭的故事。为了归处而战，即便家，正是想要离开的地方。",
  ],
  limbo: [
    "Playdead",
    "未知边缘，一道小小的剪影。在光与影之间，走过一段幽暗而细腻的旅程。",
  ],
  littlenightmares: [
    "Tarsier Studios",
    "庞大世界里，一个小小的身影。穿过那些被童年恐惧悄悄放大的角落，寻找出口。",
  ],
};
const gameNames: Record<string, [string, string]> = {
  bloodborne: ["血源诅咒", "敬畏古老之血。"],
  sekiro: ["只狼：影逝二度", "犹豫，就会败北。"],
  tlou2: ["最后生还者 第二部", "每一条路，都有代价。"],
  rdr2: ["荒野大镖客：救赎 2", "与荒野同行。"],
  godofwar: ["战神", "远行，也是新的开始。"],
  uncharted4: ["神秘海域 4", "再赴一场冒险。"],
  nier: ["尼尔：机械纪元", "愿荣光归于人类。"],
  monsterhunter: ["怪物猎人：世界", "走进新大陆。"],
  hollowknight: ["空洞骑士", "向圣巢深处去。"],
  inside: ["深入", "别停下。"],
  journey: ["风之旅人", "远山，在等你。"],
  abzu: ["智慧之海", "深海自有天地。"],
  titanfall2: ["泰坦陨落 2", "协议三：保护铁驭。"],
  nioh2: ["仁王 2", "与妖同行，与己较量。"],
  gta5: ["侠盗猎车手 V", "洛圣都，日光正盛。"],
  evilwithin: ["恶灵附身", "在噩梦中，守住生机。"],
  deadcells: ["死亡细胞", "倒下，重来，再向前。"],
  hades: ["哈迪斯", "终有一次，走出冥府。"],
  limbo: ["地狱边境", "穿过黑白，寻找答案。"],
  littlenightmares: ["小小梦魇", "直面童年的暗影。"],
};
export const games: Game[] = seedGames.map((g, i) => {
  const year = 2022 + (i % 4);
  const date = `${year}-${String((i % 10) + 1).padStart(2, "0")}-12`;
  const art =
    g.id === "journey" ? img("photo-1469474968028-56623f02e42e") : g.hero;
  return {
    ...g,
    originalTitle: g.title,
    title: gameNames[g.id][0],
    kicker: gameNames[g.id][1],
    hero: art,
    cover: art,
    platform:
      g.platform === "Indie" ? (i % 2 ? "PC" : "Nintendo Switch") : g.platform,
    description: stories[g.id][1],
    studio: stories[g.id][0],
    favorite: g.score >= 94,
    status:
      g.id === "journey" || g.id === "hollowknight" ? "Playing" : g.status,
    notes:
      g.id === "journey"
        ? "在雪里遇见一位陌生旅人。一路无言，却像彼此认识了很久。"
        : "",
    collections: [
      g.platform === "Indie"
        ? "Small worlds, big feelings"
        : "The great escape",
      ...(g.score >= 94 ? ["All-time favorites"] : []),
    ],
    firstPlayedAt: date,
    lastPlayedAt: `${year}-11-24`,
    completedAt:
      g.status === "Completed" && !["journey", "hollowknight"].includes(g.id)
        ? `${year}-12-08`
        : "",
    screenshots: [
      art,
      img(
        i % 2
          ? "photo-1441974231531-c6227db76b6e"
          : "photo-1464822759023-fed622ff2c3b",
      ),
      img("photo-1500534314209-a25ddb2bd429"),
    ],
    provider: "local",
  };
});
export const statuses: GameStatus[] = [
  "Playing",
  "Completed",
  "Backlog",
  "Paused",
];
