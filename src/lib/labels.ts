import type { Game, GameStatus } from "../data/games";

// Stored values and shared collection URLs stay stable across language changes.
const statusNames: Record<GameStatus, string> = {
  Playing: "游玩中",
  Completed: "已通关",
  Backlog: "待游玩",
  Paused: "暂时搁置",
};
const genreNames: Record<string, string> = {
  "Action RPG": "动作角色扮演",
  Action: "动作",
  "Narrative Action": "剧情动作",
  "Open World": "开放世界",
  "Action Adventure": "动作冒险",
  Adventure: "冒险",
  Metroidvania: "银河恶魔城",
  Puzzle: "解谜",
  FPS: "第一人称射击",
  "Survival Horror": "生存恐怖",
  Roguelite: "肉鸽",
  "Horror Adventure": "恐怖冒险",
};
const collectionNames: Record<string, string> = {
  "The great escape": "山海之外",
  "Small worlds, big feelings": "小小世界，万千心绪",
  "All-time favorites": "长久的偏爱",
};
export const statusLabel = (value: string) =>
  statusNames[value as GameStatus] ?? value;
export const genreLabel = (value: string) => genreNames[value] ?? value;
export const platformLabel = (value: string) =>
  value === "PC" ? "电脑" : value;
export const collectionLabel = (value: string) =>
  collectionNames[value] ?? value;
export const collectionKey = (label: string) =>
  Object.entries(collectionNames).find(([, value]) => value === label)?.[0] ??
  label;
export function gameSearchText(game: Game) {
  return [
    game.title,
    game.originalTitle,
    game.studio,
    game.genre,
    genreLabel(game.genre),
    game.platform,
    platformLabel(game.platform),
    ...game.collections,
    ...game.collections.map(collectionLabel),
  ]
    .join(" ")
    .toLocaleLowerCase("zh-CN");
}
