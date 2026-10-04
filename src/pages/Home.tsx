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
    journey: ["A world away.", "Still with you."],
    rdr2: ["The last light.", "A lasting story."],
    hollowknight: ["A little courage.", "A deeper world."],
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
            <span className="live-dot" /> A PERSONAL COLLECTION OF EXTRAORDINARY
            WORLDS
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
                {game.genre}
                <i />
                {game.year}
              </div>
              <p className="hero-description">{game.description}</p>
              <a className="button ivory" href={`#/game/${game.id}`}>
                Explore this world <ArrowRight size={17} />
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
              YOUR NEXT CHAPTER
              <br />
              <strong>Already here.</strong>
            </span>
          </a>
          <div className="feature-selector" aria-label="Featured worlds">
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
                      ? "FIND YOUR WONDER"
                      : i === 1
                        ? "TAKE THE LONG WAY"
                        : "INTO THE UNKNOWN"}
                  </small>
                  <strong>{g.title}</strong>
                </div>
                <span className="feature-line" />
              </button>
            ))}
          </div>
        </div>
        <span className="hero-side-label">VOL. 01 — WORLDS WORTH KEEPING</span>
      </section>
      <div className="archive-strip shell">
        <span>
          <span className="live-dot" /> YOUR WORLD, AT A GLANCE
        </span>
        <div>
          <strong>{games.length}</strong> worlds collected <i />
          <strong>
            {games.filter((g) => g.status === "Completed").length}
          </strong>{" "}
          stories finished <i />
          <strong>
            {games.reduce((s, g) => s + g.playtime, 0).toLocaleString()}
          </strong>{" "}
          hours well spent
        </div>
        <Sparkles size={17} />
      </div>
      <div className="home-light">
        <Rail
          title="Pick up where you left off."
          eyebrow="THE STORY CONTINUES"
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
              <p className="eyebrow">CURATED BY FEELING</p>
              <h2>A mood. A whole new world.</h2>
            </div>
            <span className="small-note">Follow your curiosity.</span>
          </Reveal>
          <div className="collection-grid">
            <a
              className="collection-feature"
              href="#/library?collection=The%20great%20escape"
            >
              <Artwork src={games.find((g) => g.id === "uncharted4")!.hero} />
              <div className="collection-shade" />
              <span className="collection-index">COLLECTION / 01</span>
              <div>
                <p className="eyebrow light">LEAVE THE EVERYDAY BEHIND</p>
                <h3>
                  The great
                  <br />
                  <em>escape.</em>
                </h3>
                <span className="collection-link">
                  {
                    games.filter((g) =>
                      g.collections.includes("The great escape"),
                    ).length
                  }{" "}
                  worlds to get lost in <ArrowRight size={19} />
                </span>
              </div>
            </a>
            <a
              className="collection-feature collection-small"
              href="#/library?collection=Small%20worlds%2C%20big%20feelings"
            >
              <Artwork src={games.find((g) => g.id === "hollowknight")!.hero} />
              <div className="collection-shade" />
              <span className="collection-index">COLLECTION / 02</span>
              <div>
                <p className="eyebrow light">MADE WITH A LITTLE MORE HEART</p>
                <h3>
                  Small worlds.
                  <br />
                  <em>Big feelings.</em>
                </h3>
                <span className="collection-link">
                  Independent by nature <ArrowRight size={19} />
                </span>
              </div>
            </a>
          </div>
        </section>
        <Rail
          title="Some things stay with you."
          eyebrow="CLOSE TO THE HEART"
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
          <p className="eyebrow light">MORE THAN A LIBRARY</p>
          <h2>
            Not just games.
            <br />
            Places you’ve been.
            <br />
            <em>Pieces of you.</em>
          </h2>
          <p>
            The impossible victories. The quiet discoveries.
            <br />
            The worlds you never quite left behind.
            <br />
            Every game has a story. This one is yours.
          </p>
          <a className="text-link" href="#/timeline">
            Revisit your journey <ArrowRight size={18} />
          </a>
        </motion.div>
        <span className="manifesto-foot">
          COLLECT EXPERIENCES. KEEP THE FEELING.
        </span>
      </section>
      <section className="home-ending shell">
        <Reveal>
          <p className="eyebrow">MAKE ROOM FOR WONDER</p>
          <h2>
            Your time.
            <br />
            <em>Beautifully spent.</em>
          </h2>
        </Reveal>
        <div>
          <p>
            A quieter space for the games you love.
            <br />
            No noise. No next big thing.
            <br />
            Just your own little universe.
          </p>
          <a className="button dark" href="#/tv">
            <Play size={15} fill="currentColor" /> Enter TV mode{" "}
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </>
  );
}
