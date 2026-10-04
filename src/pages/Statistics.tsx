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
          <p className="eyebrow">A LIFE IN PLAY</p>
          <h1>
            Every hour.
            <br />
            <em>Part of your story.</em>
          </h1>
        </Reveal>
        <p>
          A few numbers. A thousand memories.
          <br />A different way to see the worlds you love.
        </p>
      </header>
      <Reveal className="stats-headline shell">
        <div className="hours-number">
          {hours.toLocaleString()}
          <span>hours of somewhere else.</span>
        </div>
        <p>
          Time spent exploring, trying again,
          <br />
          and finding something extraordinary.
        </p>
      </Reveal>
      <div className="stats-summary shell">
        {[
          [games.length, "Worlds collected"],
          [completed, "Stories finished"],
          [favorites, "Close to your heart"],
          [average, "Average personal score"],
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
          <p className="eyebrow light">THE WORLD YOU KNOW BY HEART</p>
          <h2>{mostPlayed.title}</h2>
          <p>{mostPlayed.playtime} hours. And always a reason to return.</p>
          <a className="text-link" href={`#/game/${mostPlayed.id}`}>
            Revisit this world <ArrowUpRight size={19} />
          </a>
        </div>
      </section>
      <section className="stats-breakdown shell">
        <Reveal>
          <p className="eyebrow">WHERE YOU PLAY</p>
          <h2>
            Different platforms.
            <br />
            Same curiosity.
          </h2>
          <div className="platform-list">
            {platforms.map(([name, count], i) => (
              <div key={name}>
                <span className="platform-no">0{i + 1}</span>
                <div>
                  <strong>{name}</strong>
                  <span>
                    {Math.round((count / games.length) * 100)}% of your archive
                  </span>
                </div>
                <b>
                  {count}
                  <small>games</small>
                </b>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="eyebrow">WHAT DRAWS YOU IN</p>
          <h2>
            A taste for
            <br />
            the extraordinary.
          </h2>
          <div className="genre-bars">
            {genres.map(([name, count]) => (
              <div key={name}>
                <div>
                  <span>{name}</span>
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
          <p className="eyebrow">YOUR OWN MEASURE</p>
          <h2>The ones that resonate.</h2>
          <p className="chart-description">
            Personal scores, grouped by range.
          </p>
          <div
            className="score-chart"
            role="img"
            aria-label={buckets
              .map((b) => `${b.label}: ${b.count} games`)
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
          <p className="eyebrow">GOOD STORIES ARE TIMELESS</p>
          <h2>A collection across time.</h2>
          <p className="chart-description">Your games, by release year.</p>
          <div
            className="year-chart"
            role="img"
            aria-label={years
              .map(
                (y) =>
                  `${y}: ${games.filter((g) => g.year === y).length} games`,
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
