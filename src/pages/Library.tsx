import { useMemo, useState } from "react";
import { ArrowDownUp, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { statuses, type Game } from "../data/games";
import { Empty, GameCard, Reveal, railKeys } from "../components/ui";
export default function Library({
  games,
  onFavorite,
  query,
}: {
  games: Game[];
  onFavorite: (id: string) => void;
  query: string;
}) {
  const params = new URLSearchParams(query);
  const [search, setSearch] = useState(""),
    [genre, setGenre] = useState(""),
    [platform, setPlatform] = useState(""),
    [status, setStatus] = useState(""),
    [collection, setCollection] = useState(params.get("collection") || ""),
    [favorites, setFavorites] = useState(params.get("favorites") === "true"),
    [sort, setSort] = useState("recent"),
    [filters, setFilters] = useState(false);
  const filtered = useMemo(
    () =>
      games
        .filter(
          (g) =>
            (!search ||
              `${g.title} ${g.studio} ${g.genre}`
                .toLowerCase()
                .includes(search.toLowerCase())) &&
            (!genre || g.genre === genre) &&
            (!platform || g.platform === platform) &&
            (!status || g.status === status) &&
            (!collection || g.collections.includes(collection)) &&
            (!favorites || g.favorite),
        )
        .sort((a, b) =>
          sort === "title"
            ? a.title.localeCompare(b.title)
            : sort === "score"
              ? b.score - a.score
              : sort === "hours"
                ? b.playtime - a.playtime
                : sort === "year"
                  ? b.year - a.year
                  : b.lastPlayedAt.localeCompare(a.lastPlayedAt),
        ),
    [games, search, genre, platform, status, collection, favorites, sort],
  );
  const active =
    Number(!!genre) +
    Number(!!platform) +
    Number(!!status) +
    Number(!!collection);
  const clear = () => {
    setSearch("");
    setGenre("");
    setPlatform("");
    setStatus("");
    setCollection("");
    setFavorites(false);
  };
  return (
    <div className="page-light library-page">
      <header className="page-heading shell">
        <Reveal>
          <p className="eyebrow">
            THE PERSONAL ARCHIVE / {String(games.length).padStart(2, "0")}{" "}
            WORLDS
          </p>
          <h1>
            All your worlds.
            <br />
            <em>One place.</em>
          </h1>
        </Reveal>
        <p>
          The ones you finished. The ones you return to.
          <br />
          And everything still waiting to be discovered.
        </p>
      </header>
      <div className="library-controls shell">
        <div className="library-tabs">
          <button
            className={!favorites ? "active" : ""}
            onClick={() => setFavorites(false)}
          >
            All games <span>{games.length}</span>
          </button>
          <button
            className={favorites ? "active" : ""}
            onClick={() => setFavorites(true)}
          >
            <Heart size={15} /> Favorites{" "}
            <span>{games.filter((g) => g.favorite).length}</span>
          </button>
        </div>
        <div className="library-tools">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Search library"
              placeholder="Find a world…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </label>
          <button
            className={`filter-toggle ${active ? "selected" : ""}`}
            onClick={() => setFilters(!filters)}
            aria-expanded={filters}
          >
            <SlidersHorizontal size={17} />
            <span>Filters{active ? ` · ${active}` : ""}</span>
          </button>
        </div>
      </div>
      {filters && (
        <div className="filter-panel shell">
          {[
            ["Genre", genre, setGenre, [...new Set(games.map((g) => g.genre))]],
            [
              "Platform",
              platform,
              setPlatform,
              [...new Set(games.map((g) => g.platform))],
            ],
            ["Status", status, setStatus, statuses],
            [
              "Collection",
              collection,
              setCollection,
              [...new Set(games.flatMap((g) => g.collections))],
            ],
          ].map(([label, value, set, options]) => (
            <label key={label as string}>
              {label as string}
              <select
                aria-label={label as string}
                value={value as string}
                onChange={(e) => (set as (s: string) => void)(e.target.value)}
              >
                <option value="">All {String(label).toLowerCase()}s</option>
                {(options as string[]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <button className="text-link" onClick={clear}>
            Reset <X size={14} />
          </button>
        </div>
      )}
      <div className="library-results shell">
        <span>
          {filtered.length} {filtered.length === 1 ? "world" : "worlds"}
          {collection && (
            <>
              {" "}
              in{" "}
              <button
                className="inline-filter"
                onClick={() => setCollection("")}
              >
                {collection} <X size={12} />
              </button>
            </>
          )}
        </span>
        <label className="sort-label">
          <ArrowDownUp size={14} />
          <select
            aria-label="Sort games"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Recently played</option>
            <option value="title">Title A–Z</option>
            <option value="score">Personal score</option>
            <option value="hours">Time played</option>
            <option value="year">Release year</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="library-grid shell" onKeyDown={railKeys}>
          {filtered.map((g, i) => (
            <GameCard
              key={g.id}
              game={g}
              index={i}
              onFavorite={() => onFavorite(g.id)}
            />
          ))}
        </div>
      ) : (
        <Empty clear={clear} />
      )}
      <div className="library-colophon shell">
        <span>GOOD STORIES DON’T HAVE AN EXPIRY DATE.</span>
        <span>
          END OF COLLECTION / {String(filtered.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
