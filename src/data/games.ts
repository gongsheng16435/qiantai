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
    "A city asleep. A nightmare awake. Every street in Yharnam holds a secret, and every victory asks something of you.",
  ],
  sekiro: [
    "FromSoftware",
    "A blade, a promise, and the space between heartbeats. A journey through a broken land that teaches you to begin again.",
  ],
  tlou2: [
    "Naughty Dog",
    "Quiet moments in a world that has forgotten how to be gentle. A story about the people we hold on to, and the things we cannot let go.",
  ],
  rdr2: [
    "Rockstar Games",
    "The last light of the old West. Long rides, open skies, and a gang of outlaws looking for a place in a changing world.",
  ],
  godofwar: [
    "Santa Monica Studio",
    "A father and son, far from home. Across the realms, the most important journey is the one they take toward each other.",
  ],
  uncharted4: [
    "Naughty Dog",
    "One last adventure. A lost pirate colony, a familiar face, and the irresistible pull of the horizon.",
  ],
  nier: [
    "PlatinumGames",
    "What remains when we are gone? A beautiful, restless meditation on being human, told by those who are not.",
  ],
  monsterhunter: [
    "Capcom",
    "Follow the tracks into a living world. Learn its rhythms, meet its giants, and find your place in the wild.",
  ],
  hollowknight: [
    "Team Cherry",
    "Beneath a quiet town, a forgotten kingdom waits. Every little light in the dark is a reason to keep going.",
  ],
  inside: [
    "Playdead",
    "A boy, a forest, a world of questions. A wordless journey that lingers long after the screen goes dark.",
  ],
  journey: [
    "thatgamecompany",
    "A distant mountain. A wordless connection. An extraordinary reminder that the journey matters more when it is shared.",
  ],
  abzu: [
    "Giant Squid",
    "Leave the surface behind. Drift through a sunlit ocean and rediscover the quiet wonder of a world in motion.",
  ],
  titanfall2: [
    "Respawn Entertainment",
    "An unlikely partnership at the edge of the frontier. Some bonds are built one impossible leap at a time.",
  ],
  nioh2: [
    "Team Ninja",
    "Between the human and spirit worlds, forge your own story. Every encounter is a lesson in patience and precision.",
  ],
  gta5: [
    "Rockstar Games",
    "Three lives collide beneath the Los Santos sun. A sprawling playground of ambition, absurdity, and possibility.",
  ],
  evilwithin: [
    "Tango Gameworks",
    "Nothing is quite what it seems. Follow a fragile thread of hope through a nightmare that refuses to end.",
  ],
  deadcells: [
    "Motion Twin",
    "One more run. One more room. Find a little more courage in every new beginning.",
  ],
  hades: [
    "Supergiant Games",
    "A family story told one escape attempt at a time. Fight your way home, even if home is the place you are leaving.",
  ],
  limbo: [
    "Playdead",
    "A small silhouette at the edge of the unknown. A dark, delicate story told in light and shadow.",
  ],
  littlenightmares: [
    "Tarsier Studios",
    "A small figure in an oversized world. Find your way through the strange places where childhood fears grow.",
  ],
};
export const games: Game[] = seedGames.map((g, i) => {
  const year = 2022 + (i % 4);
  const date = `${year}-${String((i % 10) + 1).padStart(2, "0")}-12`;
  const art =
    g.id === "journey" ? img("photo-1469474968028-56623f02e42e") : g.hero;
  return {
    ...g,
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
        ? "Met a stranger in the snow. Neither of us said a word. Somehow, that was enough."
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
