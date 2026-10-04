import { genreLabel, platformLabel } from "../lib/labels";
import { ArrowUpRight } from "lucide-react";
import type { Game } from "../data/games";
import { Artwork, Reveal } from "../components/ui";
function groups(games: Game[], key: "platform" | "genre") {
  return Object.entries(
    games.reduce<Record<string, number>>((acc, g) => {
      acc[g[key]] = (acc[g[key]] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
}
export default function Statistics({ games }: { games: Game[] }) {
  const completed = games.filter((g) => g.status === "Completed").length,
    favorites = games.filter((g) => g.favorite).length,
    hours = games.reduce((s, g) => s + g.playtime, 0),
    average = Math.round(games.reduce((s, g) => s + g.score, 0) / games.length);
  const platforms = groups(games, "platform"),
    genres = groups(games, "genre"),
    years = [...new Set(games.map((g) => g.year))].sort(),
    maxYear = Math.max(
      ...years.map((y) => games.filter((g) => g.year === y).length),
    );
  const buckets = [
    { label: "0–59", min: 0, max: 59 },
    { label: "60–69", min: 60, max: 69 },
    { label: "70–79", min: 70, max: 79 },
    { label: "80–89", min: 80, max: 89 },
    { label: "90–100", min: 90, max: 100 },
  ].map((b) => ({
    ...b,
    count: games.filter((g) => g.score >= b.min && g.score <= b.max).length,
  }));
  const mostPlayed = [...games].sort((a, b) => b.playtime - a.playtime)[0];
  return (
    <div className="statistics-page">
      <header className="page-heading shell">
        <Reveal>
          <p className="eyebrow">游玩足迹</p>
          <h1>
            每一段时光，
            <br />
            <em>都有回响。</em>
          </h1>
        </Reveal>
        <p>
          数字之外，是千百次心动。
          <br />
          换个角度，看看自己的热爱。
        </p>
      </header>
      <Reveal className="stats-headline shell">
        <div className="hours-number">
          {hours.toLocaleString("zh-CN")}
          <span>小时，曾在另一个世界。</span>
        </div>
        <p>
          探索、重来，也偶然遇见惊喜。
          <br />
          那些投入的时光，都有意义。
        </p>
      </Reveal>
      <div className="stats-summary shell">
        {[
          [games.length, "珍藏游戏"],
          [completed, "已通关"],
          [favorites, "我的收藏"],
          [average, "平均个人评分"],
        ].map(([n, label]) => (
          <Reveal key={label}>
            <strong>{n}</strong>
            <span>{label}</span>
          </Reveal>
        ))}
      </div>
      <section className="stats-feature">
        <Artwork src={mostPlayed.hero} />
        <div className="collection-shade" />
        <div className="shell">
          <p className="eyebrow light">最熟悉的那片天地</p>
          <h2>{mostPlayed.title}</h2>
          <p>{mostPlayed.playtime} 小时，仍有重返的理由。</p>
          <a className="text-link" href={`#/game/${mostPlayed.id}`}>
            再次走进这个世界 <ArrowUpRight size={19} />
          </a>
        </div>
      </section>
      <section className="stats-breakdown shell">
        <Reveal>
          <p className="eyebrow">游玩平台</p>
          <h2>
            屏幕不同，
            <br />
            好奇如初。
          </h2>
          <div className="platform-list">
            {platforms.map(([name, count], i) => (
              <div key={name}>
                <span className="platform-no">0{i + 1}</span>
                <div>
                  <strong>{platformLabel(name)}</strong>
                  <span>
                    {Math.round((count / games.length) * 100)}% 的游戏来自这里
                  </span>
                </div>
                <b>
                  {count}
                  <small>款游戏</small>
                </b>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="eyebrow">偏爱的类型</p>
          <h2>
            循着热爱，
            <br />
            遇见不凡。
          </h2>
          <div className="genre-bars">
            {genres.map(([name, count]) => (
              <div key={name}>
                <div>
                  <span>{genreLabel(name)}</span>
                  <span>{count}</span>
                </div>
                <div className="bar-track">
                  <i style={{ width: `${(count / games.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="stats-charts shell">
        <Reveal>
          <p className="eyebrow">属于你的刻度</p>
          <h2>心里的分量。</h2>
          <p className="chart-description">按个人评分区间，回看每一份喜爱。</p>
          <div
            className="score-chart"
            role="img"
            aria-label={buckets
              .map((b) => `${b.label} 分：${b.count} 款游戏`)
              .join("; ")}
          >
            {buckets.map((b) => (
              <div key={b.label}>
                <span>{b.count}</span>
                <div className="score-bar-slot">
                  <i
                    style={{
                      height: `${(b.count / Math.max(...buckets.map((b) => b.count), 1)) * 100}%`,
                    }}
                  />
                </div>
                <small>{b.label}</small>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="eyebrow">好故事，不受时间限制</p>
          <h2>跨越岁月的珍藏。</h2>
          <p className="chart-description">按发行年份，看看世界如何相遇。</p>
          <div
            className="year-chart"
            role="img"
            aria-label={years
              .map(
                (y) =>
                  `${y} 年：${games.filter((g) => g.year === y).length} 款游戏`,
              )
              .join("; ")}
          >
            {years.map((y) => {
              const count = games.filter((g) => g.year === y).length;
              return (
                <div key={y}>
                  <span>{count}</span>
                  <div>
                    <i style={{ height: `${(count / maxYear) * 100}%` }} />
                  </div>
                  <small>{String(y).slice(2)}</small>
                </div>
              );
            })}
          </div>
          <div className="year-chart-caption">
            <span>{years[0]}</span>
            <span>{years.at(-1)}</span>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
