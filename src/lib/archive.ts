import { useEffect, useState } from "react";
import {
  games as initialGames,
  statuses,
  type Game,
  type PersonalPatch,
} from "../data/games";
import { localProvider } from "./providers";
const KEY = "lumen.archive.v1";
function validPatch(value: unknown): PersonalPatch {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>,
    patch: PersonalPatch = {};
  if (typeof v.favorite === "boolean") patch.favorite = v.favorite;
  if (typeof v.score === "number" && Number.isFinite(v.score))
    patch.score = Math.round(Math.max(0, Math.min(100, v.score)));
  if (typeof v.playtime === "number" && Number.isFinite(v.playtime))
    patch.playtime = Math.max(0, Math.min(99999, v.playtime));
  if (statuses.includes(v.status as Game["status"]))
    patch.status = v.status as Game["status"];
  if (typeof v.notes === "string") patch.notes = v.notes.slice(0, 10000);
  for (const key of ["firstPlayedAt", "lastPlayedAt", "completedAt"] as const) {
    if (
      typeof v[key] === "string" &&
      (v[key] === "" || /^\d{4}-\d{2}-\d{2}$/.test(v[key]))
    )
      patch[key] = v[key];
  }
  if (Array.isArray(v.collections))
    patch.collections = [
      ...new Set(
        v.collections
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim().slice(0, 80))
          .filter(Boolean),
      ),
    ].slice(0, 20);
  return patch;
}
export function useArchive() {
  const [notice, setNotice] = useState("");
  const [patches, setPatches] = useState<Record<string, PersonalPatch>>(() => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      return Object.fromEntries(
        initialGames.map((g) => [g.id, validPatch(value?.[g.id])]),
      );
    } catch {
      return {};
    }
  });
  const [base, setBase] = useState(initialGames);
  useEffect(() => {
    const controller = new AbortController();
    localProvider
      .load(controller.signal)
      .then(setBase)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  function update(id: string, patch: PersonalPatch) {
    const next = { ...patches, [id]: { ...patches[id], ...validPatch(patch) } };
    setPatches(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setNotice("已保存到你的游戏档案");
    } catch {
      setNotice("浏览器存储暂不可用，本次修改仅在当前会话中保留。");
    }
  }
  return {
    games: base.map((g) => ({ ...g, ...patches[g.id] })),
    update,
    notice,
    setNotice,
  };
}
export function go(path: string) {
  window.location.hash = path;
}
export function useRoute() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const change = () => {
      setRoute(location.hash.slice(1) || "/");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  return route;
}
export function displayDate(date: string, includeYear = true) {
  return date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
        year: includeYear ? "numeric" : undefined,
      })
    : "尚未记录";
}
