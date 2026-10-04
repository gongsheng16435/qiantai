import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Menu,
  MonitorPlay,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { Mark } from "./components/ui";
import Search from "./components/Search";
import Home from "./pages/Home";
import { go, useArchive, useRoute } from "./lib/archive";
const Library = lazy(() => import("./pages/Library"));
const Detail = lazy(() => import("./pages/Detail"));
const Timeline = lazy(() => import("./pages/Timeline"));
const Statistics = lazy(() => import("./pages/Statistics"));
const TV = lazy(() => import("./pages/TV"));
const NightHunt = lazy(() => import("./pages/NightHunt"));
export default function App() {
  const { games, update, notice, setNotice } = useArchive(),
    route = useRoute(),
    [search, setSearch] = useState(false),
    [menu, setMenu] = useState(false),
    reduce = useReducedMotion(),
    main = useRef<HTMLElement>(null),
    initial = useRef(true);
  const [path, query = ""] = route.split("?"),
    isTV = path === "/tv",
    isHunt = path === "/night-hunt",
    isImmersive = isTV || isHunt,
    isDark = path === "/" || path.startsWith("/game/") || path === "/timeline",
    game = games.find((g) => g.id === path.split("/")[2]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (location.hash.startsWith("#/night-hunt")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setMenu(false);
        if (location.hash.startsWith("#/game/")) go("/library");
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    setMenu(false);
    setSearch(false);
    document.title = `${game?.title || ({ "/": "你的世界", "/library": "游戏库", "/timeline": "时间线", "/statistics": "游玩足迹", "/tv": "大屏模式", "/night-hunt": "NIGHT HUNT · 夜猎" } as Record<string, string>)[path] || "页面未找到"} — LUMEN`;
    if (initial.current) {
      initial.current = false;
    } else main.current?.focus({ preventScroll: true });
  }, [route]);
  useEffect(() => {
    if (notice) {
      const timeout = setTimeout(() => setNotice(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [notice]);
  const favorite = (id: string) => {
    const game = games.find((g) => g.id === id)!;
    update(id, { favorite: !game.favorite });
  };
  const nav = [
    ["/", "发现"],
    ["/library", "游戏库"],
    ["/timeline", "时间线"],
    ["/statistics", "统计"],
    ["/night-hunt", "夜猎"],
  ];
  return (
    <MotionConfig reducedMotion="user">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView();
        }}
      >
        跳至主要内容
      </a>
      {!isImmersive && (
        <header
          className={`site-header ${isDark ? "on-dark" : "on-light"} ${menu ? "menu-open" : ""}`}
        >
          <a href="#/" className="brand" aria-label="LUMEN 首页">
            <Mark />
            LUMEN
          </a>
          <nav aria-label="主导航">
            {nav.map(([url, label]) => (
              <a
                key={url}
                href={`#${url}`}
                className={path === url ? "active" : ""}
                aria-current={path === url ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="search-trigger"
              aria-label="搜索游戏，快捷键 Command 或 Control 加 K"
              onClick={() => setSearch(true)}
            >
              <SearchIcon size={18} />
              <kbd>⌘ K</kbd>
            </button>
            <span className="header-divider" />
            <a href="#/tv" className="tv-trigger">
              <MonitorPlay size={18} />
              <span>大屏模式</span>
            </a>
            <button
              className="mobile-menu icon-button"
              aria-label={menu ? "收起导航" : "展开导航"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
          {menu && (
            <nav className="mobile-nav" aria-label="移动端导航">
              {nav.map(([url, label]) => (
                <a href={`#${url}`} key={url} onClick={() => setMenu(false)}>
                  {label}
                  <ArrowUpRight size={18} />
                </a>
              ))}
            </nav>
          )}
        </header>
      )}
      <main ref={main} tabIndex={-1} id="main-content">
        <Suspense
          fallback={
            <div className="page-loading">
              <Mark />
              <p>正在展开你的世界…</p>
            </div>
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={path}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.22 }}
            >
              {path === "/" ? (
                <Home games={games} onFavorite={favorite} />
              ) : path === "/library" ? (
                <Library
                  key={query}
                  games={games}
                  onFavorite={favorite}
                  query={query}
                />
              ) : path.startsWith("/game/") && game ? (
                <Detail key={game.id} game={game} update={update} />
              ) : path === "/timeline" ? (
                <Timeline games={games} />
              ) : path === "/statistics" ? (
                <Statistics games={games} />
              ) : isHunt ? (
                <NightHunt />
              ) : isTV ? (
                <TV games={games} />
              ) : (
                <div className="not-found">
                  <p className="eyebrow">地图之外</p>
                  <h1>这片世界，还未抵达。</h1>
                  <button className="button dark" onClick={() => go("/")}>
                    返回首页
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      {!isImmersive && (
        <footer className="site-footer">
          <div className="shell">
            <a href="#/" className="brand">
              <Mark />
              LUMEN
            </a>
            <span>为热爱的世界，留一处安放。</span>
            <a href="#/library">
              我的游戏档案 <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="shell footer-fine">
            <span>因热爱，而珍藏。</span>
            <span>记录留在此处，故事始终属于你。</span>
          </div>
        </footer>
      )}
      {search && <Search games={games} onClose={() => setSearch(false)} />}
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <Check size={16} />
            {notice}
          </>
        )}
      </div>
    </MotionConfig>
  );
}
