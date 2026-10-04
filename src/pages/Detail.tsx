import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { statuses, type Game, type PersonalPatch } from "../data/games";
import { Artwork, Back, Modal, Reveal } from "../components/ui";
import { displayDate } from "../lib/archive";
export default function Detail({
  game,
  update,
}: {
  game: Game;
  update: (id: string, patch: PersonalPatch) => void;
}) {
  const [editing, setEditing] = useState(false),
    [slide, setSlide] = useState<number | null>(null);
  return (
    <>
      <section className="detail-hero">
        <Artwork src={game.hero} eager />
        <div className="detail-scrim" />
        <div className="detail-content shell">
          <Back />
          <p className="eyebrow light">
            {game.studio} / {game.year}
          </p>
          <h1>{game.title}</h1>
          <p className="detail-kicker">{game.kicker}</p>
          <div className="detail-tags">
            <span>{game.platform}</span>
            <span>{game.genre}</span>
            <span className="status-label">
              <i />
              {game.status}
            </span>
          </div>
          <div className="detail-actions">
            <button className="button ivory" onClick={() => setEditing(true)}>
              <Pencil size={16} /> Edit my story
            </button>
            <button
              className={`button glass ${game.favorite ? "saved" : ""}`}
              onClick={() => update(game.id, { favorite: !game.favorite })}
            >
              <Heart size={17} fill={game.favorite ? "currentColor" : "none"} />
              {game.favorite ? "A favorite" : "Add to favorites"}
            </button>
          </div>
        </div>
        <span className="detail-art-label">
          ATMOSPHERIC ARTWORK / PERSONAL ARCHIVE
        </span>
      </section>
      <section className="detail-body shell">
        <Reveal className="detail-intro">
          <div>
            <p className="eyebrow">A WORLD WORTH REMEMBERING</p>
            <h2>{game.kicker}</h2>
            <p>{game.description}</p>
          </div>
          <dl className="personal-metrics">
            <div>
              <dt>YOUR SCORE</dt>
              <dd>
                {game.score}
                <span>/100</span>
              </dd>
            </div>
            <div>
              <dt>TIME WELL SPENT</dt>
              <dd>
                {game.playtime}
                <span>hours</span>
              </dd>
            </div>
          </dl>
        </Reveal>
        <Reveal className="gallery-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THROUGH ANOTHER LENS</p>
              <h2>Scenes & screenshots.</h2>
            </div>
            <span className="small-note">
              {game.provider === "local"
                ? "Atmospheric studies · demo imagery"
                : "From this world"}
            </span>
          </div>
          <div className="gallery-grid">
            {game.screenshots.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => setSlide(i)}
                aria-label={`Enlarge scene ${i + 1}`}
              >
                <Artwork
                  src={src}
                  alt={`${game.title} atmospheric scene ${i + 1}`}
                />
                <span>
                  0{i + 1} <Plus size={18} />
                </span>
              </button>
            ))}
          </div>
        </Reveal>
        <div className="detail-journal">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE PART ONLY YOU CAN TELL</p>
                <h2>A note to remember.</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setEditing(true)}
                aria-label="Edit notes"
              >
                <Pencil size={18} />
              </button>
            </div>
            <blockquote>
              {game.notes ||
                "Every world leaves something behind. What will you remember about this one?"}
            </blockquote>
            <span className="journal-caption">
              {game.notes
                ? "FROM YOUR PERSONAL JOURNAL"
                : "YOUR STORY IS STILL BEING WRITTEN"}
            </span>
          </Reveal>
          <Reveal className="detail-dates">
            <p className="eyebrow">YOUR JOURNEY</p>
            <dl>
              <div>
                <dt>First played</dt>
                <dd>{displayDate(game.firstPlayedAt)}</dd>
              </div>
              <div>
                <dt>Last visited</dt>
                <dd>{displayDate(game.lastPlayedAt)}</dd>
              </div>
              <div>
                <dt>Finished</dt>
                <dd>{displayDate(game.completedAt)}</dd>
              </div>
            </dl>
            <p className="eyebrow">FILED UNDER</p>
            <div className="collection-tags">
              {game.collections.length ? (
                game.collections.map((c) => (
                  <a
                    key={c}
                    href={`#/library?collection=${encodeURIComponent(c)}`}
                  >
                    {c}
                    <ArrowRight size={14} />
                  </a>
                ))
              ) : (
                <button className="text-link" onClick={() => setEditing(true)}>
                  Add to a collection <Plus size={15} />
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>
      {editing && (
        <Modal
          title={`Edit ${game.title}`}
          onClose={() => setEditing(false)}
          className="edit-modal"
        >
          <p className="eyebrow">YOUR PERSONAL ARCHIVE</p>
          <h2>Make it yours.</h2>
          <p className="modal-subtitle">{game.title} · Saved on this device</p>
          <form
            onChange={(event) => {
              const first = event.currentTarget.querySelector<HTMLInputElement>(
                '[name="firstPlayedAt"]',
              );
              first?.setCustomValidity("");
            }}
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const completedAt = String(data.get("completedAt"));
              const first = String(data.get("firstPlayedAt")),
                last = String(data.get("lastPlayedAt"));
              if (
                (first && last && first > last) ||
                (first && completedAt && first > completedAt)
              ) {
                (
                  e.currentTarget.querySelector(
                    '[name="firstPlayedAt"]',
                  ) as HTMLInputElement
                ).setCustomValidity(
                  "First played must be on or before the other dates.",
                );
                e.currentTarget.reportValidity();
                return;
              }
              update(game.id, {
                status: data.get("status") as Game["status"],
                score: Number(data.get("score")),
                playtime: Number(data.get("playtime")),
                firstPlayedAt: first,
                lastPlayedAt: last,
                completedAt,
                notes: String(data.get("notes")),
                collections: String(data.get("collections"))
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
              setEditing(false);
            }}
          >
            <div className="form-grid">
              <label>
                Status
                <select
                  aria-label="Status"
                  name="status"
                  defaultValue={game.status}
                  data-autofocus
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Personal score / 100
                <input
                  name="score"
                  type="number"
                  min="0"
                  max="100"
                  required
                  defaultValue={game.score}
                />
              </label>
              <label>
                Playtime in hours
                <input
                  name="playtime"
                  type="number"
                  min="0"
                  max="99999"
                  step="0.5"
                  required
                  defaultValue={game.playtime}
                />
              </label>
              <label>
                First played
                <input
                  type="date"
                  name="firstPlayedAt"
                  defaultValue={game.firstPlayedAt}
                  onChange={(e) => e.currentTarget.setCustomValidity("")}
                />
              </label>
              <label>
                Last played
                <input
                  type="date"
                  name="lastPlayedAt"
                  defaultValue={game.lastPlayedAt}
                />
              </label>
              <label>
                Completed on
                <input
                  type="date"
                  name="completedAt"
                  defaultValue={game.completedAt}
                />
              </label>
            </div>
            <label>
              Collections <span>Separate with commas</span>
              <input
                name="collections"
                defaultValue={game.collections.join(", ")}
                maxLength={1600}
                placeholder="Quiet Sundays, All-time favorites"
              />
            </label>
            <label>
              Personal notes
              <textarea
                name="notes"
                rows={4}
                maxLength={10000}
                defaultValue={game.notes}
                placeholder="A moment, a memory, a reason to return…"
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="text-link"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button className="button dark" type="submit">
                Save my story <Check size={17} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {slide !== null && (
        <Modal
          title={`Scene ${slide + 1} of ${game.screenshots.length}`}
          onClose={() => setSlide(null)}
          className="lightbox"
        >
          <Artwork
            src={game.screenshots[slide]}
            eager
            alt={`${game.title}, scene ${slide + 1}`}
          />
          <div className="lightbox-controls">
            <button
              className="icon-button"
              aria-label="Previous scene"
              onClick={() =>
                setSlide(
                  (slide + game.screenshots.length - 1) %
                    game.screenshots.length,
                )
              }
            >
              <ArrowLeft />
            </button>
            <span>
              {slide + 1} / {game.screenshots.length} — {game.title}
            </span>
            <button
              className="icon-button"
              aria-label="Next scene"
              onClick={() => setSlide((slide + 1) % game.screenshots.length)}
            >
              <ArrowRight />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
