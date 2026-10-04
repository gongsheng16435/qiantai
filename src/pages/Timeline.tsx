import { statusLabel } from "../lib/labels";
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
    "总有一些世界，值得重返。",
    "走远一点，遇见不一样的自己。",
    "那些绕过的路，也有风景。",
    "一切，从这里开始。",
  ];
  return (
    <section ref={ref} className="timeline-chapter shell">
      <div className="chapter-year">
        <span>篇章 {String(index + 1).padStart(2, "0")}</span>
        <h2>{year}</h2>
        <p>
          {games.length} 款游戏 · {games.reduce((s, g) => s + g.playtime, 0)}{" "}
          小时
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
                {displayDate(g.firstPlayedAt, false)}
              </span>
              <div>
                <h4>{g.title}</h4>
                <p>
                  {statusLabel(g.status)} · {g.playtime} 小时
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
          <p className="eyebrow">一路走来</p>
          <h1>
            时光向前，
            <br />
            <em>回忆仍在。</em>
          </h1>
        </Reveal>
        <p>
          沿着游戏的足迹，拾起散落的片刻。
          <br />
          每一次启程，都在写下自己的故事。
        </p>
      </header>
      <div className="timeline-intro shell">
        <span>
          {years.length
            ? `${[...years].reverse()[0]} — ${years[0]}`
            : "故事，从此刻开始"}
        </span>
        <span>我的游玩编年史</span>
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
          <p className="eyebrow">等待标记的日子</p>
          <h2>每段故事，都有一个起点。</h2>
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
          下一章，
          <br />
          <em>由你续写。</em>
        </h2>
        <a href="#/library" className="text-link">
          寻找下一站 <ArrowUpRight size={19} />
        </a>
      </div>
    </div>
  );
}
