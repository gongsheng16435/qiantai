import { useRef } from "react";
import {
  useScroll,
  useTransform,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Game } from "../data/games";
import { Artwork, Reveal } from "../components/ui";
import { displayDate } from "../lib/archive";
function Chapter({
  year,
  games,
  index,
}: {
  year: string;
  games: Game[];
  index: number;
}) {
  const ref = useRef<HTMLElement>(null),
    reduce = useReducedMotion(),
    { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    });
  const y = useTransform(scrollYProgress, [0, 1], [-35, 35]);
  const titles = [
    "The worlds we return to.",
    "A little further from ordinary.",
    "The beautiful detours.",
    "Where it all began.",
  ];
  return (
    <section ref={ref} className="timeline-chapter shell">
      <div className="chapter-year">
        <span>CHAPTER {String(index + 1).padStart(2, "0")}</span>
        <h2>{year}</h2>
        <p>
          {games.length} worlds · {games.reduce((s, g) => s + g.playtime, 0)}{" "}
          hours
        </p>
      </div>
      <div className="chapter-content">
        <Reveal>
          <a className="chapter-image" href={`#/game/${games[0].id}`}>
            <motion.div style={{ y: reduce ? 0 : y }}>
              <Artwork src={games[0].hero} />
            </motion.div>
            <div className="collection-shade" />
            <span>
              {games[0].title}
              <ArrowUpRight size={24} />
            </span>
          </a>
          <h3>{titles[index % titles.length]}</h3>
          <p className="chapter-description">
            {games[0].notes || games[0].description}
          </p>
        </Reveal>
        <div className="timeline-entries">
          {games.map((g) => (
            <a key={g.id} href={`#/game/${g.id}`}>
              <span className="timeline-date">
                {displayDate(g.firstPlayedAt).replace(`, ${year}`, "")}
              </span>
              <div>
                <h4>{g.title}</h4>
                <p>
                  {g.status} · {g.playtime} hours
                </p>
              </div>
              <span className="timeline-score">
                {g.score}
                <small>/100</small>
              </span>
              <ArrowUpRight size={17} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
export default function Timeline({ games }: { games: Game[] }) {
  const years = [
    ...new Set(
      games
        .filter((g) => g.firstPlayedAt)
        .map((g) => g.firstPlayedAt.slice(0, 4)),
    ),
  ]
    .sort()
    .reverse();
  const undated = games.filter((g) => !g.firstPlayedAt);
  return (
    <div className="timeline-page">
      <header className="page-heading shell">
        <Reveal>
          <p className="eyebrow">THE STORY SO FAR</p>
          <h1>
            Time passes.
            <br />
            <em>Worlds remain.</em>
          </h1>
        </Reveal>
        <p>
          Not a list of games. A collection of moments.
          <br />
          Follow the thread of your own adventure.
        </p>
      </header>
      <div className="timeline-intro shell">
        <span>
          {years.length
            ? `${[...years].reverse()[0]} — ${years[0]}`
            : "YOUR STORY BEGINS HERE"}
        </span>
        <span>A PERSONAL HISTORY OF PLAY</span>
      </div>
      {years.map((year, i) => (
        <Chapter
          key={year}
          year={year}
          games={games
            .filter((g) => g.firstPlayedAt.startsWith(year))
            .sort((a, b) => b.firstPlayedAt.localeCompare(a.firstPlayedAt))}
          index={i}
        />
      ))}
      {undated.length > 0 && (
        <section className="undated shell">
          <p className="eyebrow">STILL TO BE DATED</p>
          <h2>Every story starts somewhere.</h2>
          {undated.map((g) => (
            <a key={g.id} href={`#/game/${g.id}`}>
              {g.title}
              <ArrowUpRight size={17} />
            </a>
          ))}
        </section>
      )}
      <div className="timeline-end shell">
        <span className="live-dot" />
        <h2>
          The next chapter
          <br />
          <em>is yours.</em>
        </h2>
        <a href="#/library" className="text-link">
          Find your next world <ArrowUpRight size={19} />
        </a>
      </div>
    </div>
  );
}
