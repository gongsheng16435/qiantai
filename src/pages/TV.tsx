import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Heart,
  Minimize,
  X,
} from "lucide-react";
import type { Game } from "../data/games";
import { Artwork, Mark, railKeys } from "../components/ui";
import { go } from "../lib/archive";
export default function TV({ games }: { games: Game[] }) {
  const [selected, setSelected] = useState(0),
    [fullscreen, setFullscreen] = useState(!!document.fullscreenElement),
    [message, setMessage] = useState(""),
    ref = useRef<HTMLDivElement>(null),
    reduce = useReducedMotion(),
    game = games[selected];
  const exit = () => {
    if (document.fullscreenElement)
      void document.exitFullscreen().catch(() => {});
    go("/");
  };
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>(".tv-card")?.focus();
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        ref.current
          ?.querySelectorAll<HTMLElement>(".tv-card")
          [selected]?.focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        document.getElementById("tv-open")?.focus();
      }
    };
    const full = () => setFullscreen(!!document.fullscreenElement);
    window.addEventListener("keydown", key);
    document.addEventListener("fullscreenchange", full);
    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("fullscreenchange", full);
    };
  }, [selected]);
  // Standard-mapped controllers: D-pad / left stick, A opens, B exits.
  useEffect(() => {
    let raf = 0,
      last = 0;
    const tick = (time: number) => {
      const pad = navigator.getGamepads?.()?.find(Boolean);
      if (pad && time - last > 220) {
        let action = "";
        if (pad.buttons[15]?.pressed || pad.axes[0] > 0.5) action = "right";
        if (pad.buttons[14]?.pressed || pad.axes[0] < -0.5) action = "left";
        if (pad.buttons[0]?.pressed) action = "open";
        if (pad.buttons[1]?.pressed) action = "exit";
        if (action) {
          last = time;
          if (action === "open") go(`/game/${game.id}`);
          else if (action === "exit") exit();
          else {
            const next = Math.max(
              0,
              Math.min(
                games.length - 1,
                selected + (action === "right" ? 1 : -1),
              ),
            );
            ref.current
              ?.querySelectorAll<HTMLElement>(".tv-card")
              [next]?.focus();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selected, game.id, games.length]);
  return (
    <div className="tv-mode">
      <AnimatePresence initial={false}>
        <motion.div
          className="tv-art"
          key={game.id}
          initial={{ opacity: 0, scale: reduce ? 1 : 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.7 }}
        >
          <Artwork src={game.hero} eager />
        </motion.div>
      </AnimatePresence>
      <div className="tv-scrim" />
      <header className="tv-header">
        <a
          className="brand"
          href="#/"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
          }}
        >
          <Mark />
          LUMEN <span>LEAN BACK. GET LOST.</span>
        </a>
        <div>
          <button
            className="icon-button"
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={async () => {
              try {
                if (document.fullscreenElement) await document.exitFullscreen();
                else await document.documentElement.requestFullscreen();
                setMessage("");
              } catch {
                setMessage(
                  "Fullscreen is unavailable here. TV mode still works in this window.",
                );
              }
            }}
          >
            {fullscreen ? <Minimize size={20} /> : <Expand size={20} />}
          </button>
          <button
            className="icon-button"
            onClick={exit}
            aria-label="Exit TV mode"
          >
            <X size={22} />
          </button>
        </div>
      </header>
      <div className="tv-description">
        <p className="eyebrow light">
          YOUR NEXT WORLD{" "}
          <span> / {String(selected + 1).padStart(2, "0")}</span>
        </p>
        <h1>{game.title}</h1>
        <p>{game.kicker}</p>
        <div className="tv-meta">
          {game.platform}
          <i>·</i>
          {game.year}
          <i>·</i>
          {game.score} / 100
          {game.favorite && <Heart size={15} fill="currentColor" />}
        </div>
        <a id="tv-open" className="text-link" href={`#/game/${game.id}`}>
          Explore game <ArrowRight size={18} />
        </a>
      </div>
      <div
        ref={ref}
        className="tv-rail"
        onKeyDown={railKeys}
        aria-label="Select a game"
      >
        {games.map((g, i) => (
          <a
            className={`tv-card ${selected === i ? "focused" : ""}`}
            href={`#/game/${g.id}`}
            key={g.id}
            onFocus={(e) => {
              setSelected(i);
              e.currentTarget.scrollIntoView({
                inline: "center",
                block: "nearest",
                behavior: reduce ? "instant" : "smooth",
              });
            }}
          >
            <Artwork src={g.cover} />
            <span>{g.title}</span>
          </a>
        ))}
      </div>
      <footer className="tv-footer">
        <span>
          <kbd>←</kbd>
          <kbd>→</kbd> Explore <kbd>↵</kbd> Open <kbd>esc</kbd> Return
        </span>
        <span>{message || "YOUR UNIVERSE. A LITTLE BIGGER."}</span>
      </footer>
    </div>
  );
}
