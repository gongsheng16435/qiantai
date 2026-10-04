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
    .filter((g) =>
      `${g.title} ${g.genre} ${g.studio} ${g.collections.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
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
    <Modal
      title="Search your worlds"
      onClose={onClose}
      className="search-modal"
    >
      <div className="command-input">
        <SearchIcon size={22} />
        <input
          data-autofocus
          placeholder="Find your next world…"
          aria-label="Search all games"
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
        {query ? `${results.length} WORLDS FOUND` : "SOMEWHERE TO BEGIN"}
      </p>
      <div
        ref={ref}
        className="search-results"
        id="search-results"
        role="listbox"
        aria-label="Games"
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
                  {g.genre} · {g.platform}
                </span>
              </div>
              <ArrowUpRight size={18} />
            </button>
          ))
        ) : (
          <div className="search-empty">
            <h3>No worlds found.</h3>
            <p>Try a title, genre, studio, or collection.</p>
          </div>
        )}
      </div>
      <div className="command-footer">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> to explore <kbd>↵</kbd> to open
        </span>
        <span>
          <kbd>esc</kbd> to close
        </span>
      </div>
    </Modal>
  );
}
