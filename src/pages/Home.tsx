import { genreLabel } from "../lib/labels";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowRight, Play, Sparkles } from "lucide-react";
import type { Game } from "../data/games";
import { Artwork, Rail, Reveal } from "../components/ui";
export default function Home({
  games,
  onFavorite,
}: {
  games: Game[];
  onFavorite: (id: string) => void;
}) {
  const [featured, setFeatured] = useState("journey");
  const game = games.find((g) => g.id === featured)!,
    ref = useRef<HTMLElement>(null),
    reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const statementRef = useRef<HTMLElement>(null);
  const { scrollYProgress: statementProgress } = useScroll({
    target: statementRef,
    offset: ["start end", "end start"],
  });
  const statementY = useTransform(statementProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const featuredGames = ["journey", "rdr2", "hollowknight"].map(
    (id) => games.find((g) => g.id === id)!,
  );
  const headlines: Record<string, [string, string]> = {
    journey: ["去过的远方，", "仍在心上。"],
    rdr2: ["荒野日暮，", "故事未远。"],
    hollowknight: ["携一点微光，", "赴深处回响。"],
  };
  return (
    <>
      <section
        className="home-hero"
        ref={ref}
        style={{ backgroundColor: game.accent }}
      >
        <motion.div className="hero-parallax" style={{ y: reduce ? 0 : y }}>
          <AnimatePresence initial={false}>
            <motion.div
              className="hero-image-layer"
              key={game.id}
              initial={{ opacity: 0, scale: reduce ? 1 : 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 1.1 }}
            >
              <Artwork src={game.hero} eager />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="hero-scrim" />
        <motion.div
          className="hero-story shell"
          style={{ opacity: reduce ? 1 : opacity }}
        >
          <p className="eyebrow light">
            <span className="live-dot" /> 把热爱走成风景，把回忆收进此处
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: reduce ? 0 : 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: reduce ? 0 : 0.4 }}
            >
              <h1>
                {headlines[game.id][0]}
                <br />
                <em>{headlines[game.id][1]}</em>
              </h1>
              <div className="hero-game-line">
                <span>{game.title}</span>
                <i />
                {genreLabel(game.genre)}
                <i />
                {game.year}
              </div>
              <p className="hero-description">{game.description}</p>
              <a className="button ivory" href={`#/game/${game.id}`}>
                走进这个世界 <ArrowRight size={17} />
              </a>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="hero-bottom shell">
          <a href="#/library" className="hero-discover">
            <span className="circle-arrow">
              <ArrowDown size={17} />
            </span>
            <span>
              下一段故事
              <br />
              <strong>等你启程。</strong>
            </span>
          </a>
          <div className="feature-selector" aria-label="精选游戏">
            {featuredGames.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setFeatured(g.id)}
                aria-pressed={g.id === featured}
                className={g.id === featured ? "active" : ""}
              >
                <span className="feature-number">0{i + 1}</span>
                <div>
                  <small>
                    {i === 0
                      ? "与微光相逢"
                      : i === 1
                        ? "慢行于旷野"
                        : "向幽深处去"}
                  </small>
                  <strong>{g.title}</strong>
                </div>
                <span className="feature-line" />
              </button>
            ))}
          </div>
        </div>
        <span className="hero-side-label">卷一 · 那些值得珍藏的世界</span>
      </section>
      <div className="archive-strip shell">
        <span>
          <span className="live-dot" /> 你的世界，一眼回望
        </span>
        <div>
          <strong>{games.length}</strong> 款珍藏游戏 <i />
          <strong>
            {games.filter((g) => g.status === "Completed").length}
          </strong>{" "}
          段已通关的故事 <i />
          <strong>
            {games.reduce((s, g) => s + g.playtime, 0).toLocaleString("zh-CN")}
          </strong>{" "}
          小时游玩时光
        </div>
        <Sparkles size={17} />
      </div>
      <a
        className="home-hunt-feature"
        href="#/night-hunt"
        aria-label="进入 NIGHT HUNT 夜猎小游戏"
      >
        <img
          src={`${import.meta.env.BASE_URL}night-hunt/cover.svg`}
          alt="月下的钟庭废墟与巨兽线描"
          loading="lazy"
        />
        <div className="home-hunt-copy">
          <p>可玩短篇 / LUMEN ORIGINAL</p>
          <h2>NIGHT HUNT</h2>
          <span>月落之前，直面长夜。</span>
          <strong>
            PLAY <ArrowRight size={21} />
          </strong>
        </div>
        <span className="home-hunt-caption">
          一位猎人 · 一场交锋 · 五分钟的长夜
        </span>
      </a>
      <div className="home-light">
        <Rail
          title="故事，待你续写。"
          eyebrow="最近游玩"
          games={[...games]
            .sort(
              (a, b) =>
                Number(b.status === "Playing") -
                  Number(a.status === "Playing") ||
                b.lastPlayedAt.localeCompare(a.lastPlayedAt),
            )
            .slice(0, 8)}
          onFavorite={onFavorite}
        />
        <section className="collections-section shell">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">循着心绪，整理热爱</p>
              <h2>随心，启程。</h2>
            </div>
            <span className="small-note">让好奇心带路。</span>
          </Reveal>
          <div className="collection-grid">
            <a
              className="collection-feature"
              href="#/library?collection=The%20great%20escape"
            >
              <Artwork src={games.find((g) => g.id === "uncharted4")!.hero} />
              <div className="collection-shade" />
              <span className="collection-index">主题合集 / 01</span>
              <div>
                <p className="eyebrow light">暂别日常，走向辽阔</p>
                <h3>
                  山海
                  <br />
                  <em>之外。</em>
                </h3>
                <span className="collection-link">
                  {
                    games.filter((g) =>
                      g.collections.includes("The great escape"),
                    ).length
                  }{" "}
                  个值得远行的世界 <ArrowRight size={19} />
                </span>
              </div>
            </a>
            <a
              className="collection-feature collection-small"
              href="#/library?collection=Small%20worlds%2C%20big%20feelings"
            >
              <Artwork src={games.find((g) => g.id === "hollowknight")!.hero} />
              <div className="collection-shade" />
              <span className="collection-index">主题合集 / 02</span>
              <div>
                <p className="eyebrow light">小小篇幅，也有真切心意</p>
                <h3>
                  小小世界，
                  <br />
                  <em>万千心绪。</em>
                </h3>
                <span className="collection-link">
                  独立之作，自有回响 <ArrowRight size={19} />
                </span>
              </div>
            </a>
          </div>
        </section>
        <Rail
          title="念念不忘的世界。"
          eyebrow="我的收藏"
          games={games.filter((g) => g.favorite)}
          onFavorite={onFavorite}
          link="/library?favorites=true"
        />
      </div>
      <section className="manifesto" ref={statementRef}>
        <div className="manifesto-image">
          <Artwork src={games.find((g) => g.id === "rdr2")!.hero} />
        </div>
        <motion.div
          className="manifesto-copy shell"
          style={{ y: reduce ? 0 : statementY }}
        >
          <p className="eyebrow light">一座游戏库，也是一段来路</p>
          <h2>
            那些游戏，
            <br />
            是走过的远方，
            <br />
            <em>也是自己的一部分。</em>
          </h2>
          <p>
            记得那场险胜，也记得一次无声的发现。
            <br />
            有些世界，离开以后仍会想念。
            <br />
            每一段旅程，都留下了你的故事。
          </p>
          <a className="text-link" href="#/timeline">
            回看我的旅程 <ArrowRight size={18} />
          </a>
        </motion.div>
        <span className="manifesto-foot">收藏走过的路，留住心里的光。</span>
      </section>
      <section className="home-ending shell">
        <Reveal>
          <p className="eyebrow">给热爱，一点时间</p>
          <h2>
            时光有去处，
            <br />
            <em>热爱有回声。</em>
          </h2>
        </Reveal>
        <div>
          <p>
            给喜欢的游戏，一处安静的角落。
            <br />
            暂别喧闹，也不必追赶。
            <br />
            在自己的小小宇宙里，慢慢探索。
          </p>
          <a className="button dark" href="#/tv">
            <Play size={15} fill="currentColor" /> 进入大屏模式{" "}
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </>
  );
}
