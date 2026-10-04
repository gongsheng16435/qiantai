import { games, type Game } from "../data/games";
export type Artwork = Pick<Game, "hero" | "cover" | "screenshots">;
export interface ArtworkProvider {
  name: Game["provider"];
  resolve(id: string, signal?: AbortSignal): Promise<Partial<Artwork>>;
}
function asset(path: string) {
  if (/^https:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
export const localProvider = {
  name: "local" as const,
  async load(signal?: AbortSignal): Promise<Game[]> {
    const response = await fetch(
      `${import.meta.env.BASE_URL}games/manifest.json`,
      { signal },
    );
    if (!response.ok) return games;
    const overrides = (await response.json()) as Record<
      string,
      Partial<Artwork>
    >;
    return games.map((g) => {
      const a = overrides[g.id];
      return a
        ? {
            ...g,
            hero: typeof a.hero === "string" ? asset(a.hero) : g.hero,
            cover: typeof a.cover === "string" ? asset(a.cover) : g.cover,
            screenshots: Array.isArray(a.screenshots)
              ? a.screenshots.filter((x) => typeof x === "string").map(asset)
              : g.screenshots,
          }
        : g;
    });
  },
  async resolve(id: string) {
    return (await this.load()).find((g) => g.id === id) || {};
  },
} satisfies ArtworkProvider & { load(signal?: AbortSignal): Promise<Game[]> };
// Remote adapters accept a same-origin gateway. Keep provider credentials server-side.
// Nothing calls these adapters in the credential-free local demo.
async function remote(endpoint: string, id: string, signal?: AbortSignal) {
  const url = new URL(endpoint, location.origin);
  if (url.origin !== location.origin)
    throw new Error("Use a same-origin provider gateway");
  url.searchParams.set("id", id);
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error(`Artwork provider returned ${response.status}`);
  return response.json();
}
export function steamProvider(endpoint: string): ArtworkProvider {
  return {
    name: "steam",
    async resolve(id, signal) {
      const result = await remote(endpoint, id, signal),
        data = result[id]?.data ?? result;
      return {
        hero: data.background_raw || data.header_image,
        cover: data.header_image,
        screenshots:
          data.screenshots?.map((s: { path_full: string }) => s.path_full) ??
          [],
      };
    },
  };
}
export function rawgProvider(endpoint: string): ArtworkProvider {
  return {
    name: "rawg",
    async resolve(id, signal) {
      const data = await remote(endpoint, id, signal);
      return {
        hero: data.background_image,
        cover: data.background_image,
        screenshots: (data.short_screenshots ?? data.screenshots ?? []).map(
          (s: { image: string }) => s.image,
        ),
      };
    },
  };
}
export function igdbProvider(endpoint: string): ArtworkProvider {
  return {
    name: "igdb",
    async resolve(id, signal) {
      const result = await remote(endpoint, id, signal),
        data = Array.isArray(result) ? result[0] : result;
      const image = (id: string) =>
        `https://images.igdb.com/igdb/image/upload/t_1080p/${id}.jpg`;
      return {
        cover: data.cover?.image_id ? image(data.cover.image_id) : undefined,
        hero: data.artworks?.[0]?.image_id
          ? image(data.artworks[0].image_id)
          : undefined,
        screenshots: (data.screenshots ?? []).map((s: { image_id: string }) =>
          image(s.image_id),
        ),
      };
    },
  };
}
