import { genreLabel, platformLabel, statusLabel } from "../lib/labels";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, X } from "lucide-react";
import type { Game } from "../data/games";
import { go } from "../lib/archive";
export function Mark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2v28M2 16h28M6.1 6.1l19.8 19.8M6.1 25.9L25.9 6.1"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
    </svg>
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Artwork({
  src,
  alt = "",
  className = "",
  eager = false,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  eager?: boolean;
  style?: CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={`artwork ${loaded ? "is-loaded" : ""} ${className}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={style}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        const fallback = `${import.meta.env.BASE_URL}artwork/photo-1469474968028-56623f02e42e.jpg`;
        if (
          !e.currentTarget.src.endsWith("photo-1469474968028-56623f02e42e.jpg")
        )
          e.currentTarget.src = fallback;
        else setLoaded(true);
      }}
    />
  );
}
export function Favorite({
  game,
  onToggle,
}: {
  game: Game;
  onToggle: () => void;
}) {
  return (
    <button
      className={`favorite ${game.favorite ? "is-favorite" : ""}`}
      onClick={onToggle}
      aria-label={`${game.favorite ? "取消收藏" : "收藏"}《${game.title}》`}
      aria-pressed={game.favorite}
    >
      <Heart size={17} fill={game.favorite ? "currentColor" : "none"} />
    </button>
  );
}
export function GameCard({
  game,
  onFavorite,
  index = 0,
}: {
  game: Game;
  onFavorite: () => void;
  index?: number;
}) {
  return (
    <article
      className="game-card"
      style={{ "--card-accent": game.accent } as CSSProperties}
    >
      <a
        href={`#/game/${game.id}`}
        className="cover-link"
        aria-label={`查看《${game.title}》`}
      >
        <Artwork src={game.cover} />
        <div className="cover-shade" />
        <span className="cover-edition">
          LUMEN 私藏 <span>{String(index + 1).padStart(2, "0")}</span>
        </span>
        <div className={`cover-type cover-${game.id}`}>
          <span>{game.studio}</span>
          <strong>
            {game.title.split("：").map((part, i) => (
              <span className="cover-title-line" key={i}>
                {part}
              </span>
            ))}
          </strong>
          <i>{game.kicker}</i>
        </div>
        <span className="cover-open">
          <ArrowRight size={20} />
        </span>
      </a>
      <Favorite game={game} onToggle={onFavorite} />
      <a href={`#/game/${game.id}`} className="card-caption">
        <div>
          <h3>{game.title}</h3>
          <span>
            {platformLabel(game.platform)} <i>·</i> {genreLabel(game.genre)}
          </span>
        </div>
        <small className={game.status === "Playing" ? "playing" : ""}>
          {game.status === "Playing" && <b />}
          {statusLabel(game.status)}
        </small>
      </a>
    </article>
  );
}
export function railKeys(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const elements = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      ".cover-link, .tv-card",
    ),
  ];
  const index = elements.indexOf(document.activeElement as HTMLElement);
  if (index < 0) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? elements.length - 1
        : Math.max(
            0,
            Math.min(
              elements.length - 1,
              index + (event.key === "ArrowRight" ? 1 : -1),
            ),
          );
  elements[next]?.focus();
  elements[next]?.scrollIntoView({
    block: "nearest",
    inline: "center",
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}
export function Rail({
  title,
  eyebrow,
  games,
  onFavorite,
  link = "/library",
}: {
  title: string;
  eyebrow: string;
  games: Game[];
  onFavorite: (id: string) => void;
  link?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="rail-section">
      <Reveal className="section-heading shell">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="rail-actions">
          <a className="text-link" href={`#${link}`}>
            查看全部 <ArrowRight size={16} />
          </a>
          <div className="arrow-controls">
            <button
              aria-label={`向左浏览：${title}`}
              onClick={() =>
                ref.current?.scrollBy({ left: -600, behavior: "smooth" })
              }
            >
              <ArrowLeft size={17} />
            </button>
            <button
              aria-label={`向右浏览：${title}`}
              onClick={() =>
                ref.current?.scrollBy({ left: 600, behavior: "smooth" })
              }
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </Reveal>
      <div ref={ref} className="game-rail" onKeyDown={railKeys}>
        {games.length ? (
          games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onFavorite={() => onFavorite(game.id)}
            />
          ))
        ) : (
          <div className="rail-empty">
            这里留给你的偏爱。点亮爱心，收藏念念不忘的世界。
          </div>
        )}
      </div>
    </section>
  );
}
export function Modal({
  children,
  title,
  onClose,
  className = "",
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      [
        ...ref.current!.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]',
        ),
      ].filter((el) => el.getClientRects().length);
    (
      ref.current?.querySelector<HTMLElement>("[data-autofocus]") ||
      focusable()[0]
    )?.focus();
    const key = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeRef.current();
      }
      if (event.key === "Tab") {
        const list = focusable(),
          first = list[0],
          last = list.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key, true);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key, true);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="modal-close icon-button"
          onClick={onClose}
          aria-label="关闭弹窗"
        >
          <X size={21} />
        </button>
        {children}
      </div>
    </div>
  );
}
export function Empty({ clear }: { clear: () => void }) {
  return (
    <div className="empty-state">
      <Mark />
      <h2>换个方向，也许就能遇见。</h2>
      <p>没有符合条件的游戏，试试其他关键词或筛选条件。</p>
      <button className="button dark" onClick={clear}>
        清除筛选 <ArrowRight size={16} />
      </button>
    </div>
  );
}
export function Back({
  to = "/library",
  label = "返回游戏库",
}: {
  to?: string;
  label?: string;
}) {
  return (
    <button className="text-link back" onClick={() => go(to)}>
      <ArrowLeft size={17} />
      {label}
    </button>
  );
}
