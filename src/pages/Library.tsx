import {
  gameSearchText,
  genreLabel,
  platformLabel,
  statusLabel,
  collectionLabel,
} from "../lib/labels";
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
            (!search || gameSearchText(g).includes(search.toLowerCase())) &&
            (!genre || g.genre === genre) &&
            (!platform || g.platform === platform) &&
            (!status || g.status === status) &&
            (!collection || g.collections.includes(collection)) &&
            (!favorites || g.favorite),
        )
        .sort((a, b) =>
          sort === "title"
            ? a.title.localeCompare(b.title, "zh-CN")
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
            我的游戏档案 / {String(games.length).padStart(2, "0")} 款游戏
          </p>
          <h1>
            万千世界，
            <br />
            <em>一处珍藏。</em>
          </h1>
        </Reveal>
        <p>
          那些通关的故事，那些重返的旧地，
          <br />
          还有尚未启程的远方。
        </p>
      </header>
      <div className="library-controls shell">
        <div className="library-tabs">
          <button
            className={!favorites ? "active" : ""}
            onClick={() => setFavorites(false)}
          >
            全部游戏 <span>{games.length}</span>
          </button>
          <button
            className={favorites ? "active" : ""}
            onClick={() => setFavorites(true)}
          >
            <Heart size={15} /> 我的收藏{" "}
            <span>{games.filter((g) => g.favorite).length}</span>
          </button>
        </div>
        <div className="library-tools">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="搜索游戏库"
              placeholder="搜索游戏、中英文名称…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label="清空搜索" onClick={() => setSearch("")}>
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
            <span>筛选{active ? ` · ${active}` : ""}</span>
          </button>
        </div>
      </div>
      {filters && (
        <div className="filter-panel shell">
          {[
            ["类型", genre, setGenre, [...new Set(games.map((g) => g.genre))]],
            [
              "平台",
              platform,
              setPlatform,
              [...new Set(games.map((g) => g.platform))],
            ],
            ["状态", status, setStatus, statuses],
            [
              "合集",
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
                <option value="">全部{label as string}</option>
                {(options as string[]).map((o) => (
                  <option key={o} value={o}>
                    {label === "类型"
                      ? genreLabel(o)
                      : label === "平台"
                        ? platformLabel(o)
                        : label === "状态"
                          ? statusLabel(o)
                          : collectionLabel(o)}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button className="text-link" onClick={clear}>
            重置 <X size={14} />
          </button>
        </div>
      )}
      <div className="library-results shell">
        <span>
          {filtered.length} 款游戏
          {collection && (
            <>
              {" "}
              来自{" "}
              <button
                className="inline-filter"
                onClick={() => setCollection("")}
              >
                {collectionLabel(collection)} <X size={12} />
              </button>
            </>
          )}
        </span>
        <label className="sort-label">
          <ArrowDownUp size={14} />
          <select
            aria-label="游戏排序"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">最近游玩</option>
            <option value="title">名称（拼音顺序）</option>
            <option value="score">个人评分</option>
            <option value="hours">游玩时长</option>
            <option value="year">发行年份</option>
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
        <span>好故事，值得一再重逢。</span>
        <span>本次浏览至此 / {String(filtered.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
