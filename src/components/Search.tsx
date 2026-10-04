import { gameSearchText, genreLabel, platformLabel } from "../lib/labels";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Search as SearchIcon } from "lucide-react";
import type { Game } from "../data/games";
import { Artwork, Modal } from "./ui";
import { go } from "../lib/archive";
export default function Search({
  games,
  onClose,
}: {
  games: Game[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState(""),
    [active, setActive] = useState(0),
    ref = useRef<HTMLDivElement>(null);
  const results = games
    .filter((g) => gameSearchText(g).includes(query.toLowerCase()))
    .slice(0, 8);
  useEffect(() => {
    ref.current
      ?.querySelectorAll(".search-result")
      [active]?.scrollIntoView({ block: "nearest" });
  }, [active]);
  const open = (id: string) => {
    onClose();
    go(`/game/${id}`);
  };
  return (
    <Modal title="搜索游戏" onClose={onClose} className="search-modal">
      <div className="command-input">
        <SearchIcon size={22} />
        <input
          data-autofocus
          placeholder="下一站，想去哪里？"
          aria-label="搜索全部游戏"
          role="combobox"
          aria-controls="search-results"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-activedescendant={
            results[active] ? `result-${results[active].id}` : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive(Math.min(results.length - 1, active + 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive(Math.max(0, active - 1));
            }
            if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              open(results[active].id);
            }
          }}
        />
      </div>
      <p className="eyebrow">
        {query ? `找到 ${results.length} 款游戏` : "从这里启程"}
      </p>
      <div
        ref={ref}
        className="search-results"
        id="search-results"
        role="listbox"
        aria-label="游戏搜索结果"
      >
        {results.length ? (
          results.map((g, i) => (
            <button
              key={g.id}
              id={`result-${g.id}`}
              className={`search-result ${i === active ? "active" : ""}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => open(g.id)}
            >
              <Artwork src={g.cover} />
              <div>
                <strong>{g.title}</strong>
                <span>
                  {genreLabel(g.genre)} · {platformLabel(g.platform)}
                </span>
              </div>
              <ArrowUpRight size={18} />
            </button>
          ))
        ) : (
          <div className="search-empty">
            <h3>还没有找到这个世界。</h3>
            <p>试试中文名、英文原名、类型、工作室或合集。</p>
          </div>
        )}
      </div>
      <div className="command-footer">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> 选择 <kbd>↵</kbd> 打开
        </span>
        <span>
          <kbd>esc</kbd> 关闭
        </span>
      </div>
    </Modal>
  );
}
