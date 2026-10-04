import {
  genreLabel,
  platformLabel,
  statusLabel,
  collectionLabel,
  collectionKey,
} from "../lib/labels";
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
            <span>{platformLabel(game.platform)}</span>
            <span>{genreLabel(game.genre)}</span>
            <span className="status-label">
              <i />
              {statusLabel(game.status)}
            </span>
          </div>
          <div className="detail-actions">
            <button className="button ivory" onClick={() => setEditing(true)}>
              <Pencil size={16} /> 编辑我的记录
            </button>
            <button
              className={`button glass ${game.favorite ? "saved" : ""}`}
              onClick={() => update(game.id, { favorite: !game.favorite })}
            >
              <Heart size={17} fill={game.favorite ? "currentColor" : "none"} />
              {game.favorite ? "已收藏" : "加入收藏"}
            </button>
          </div>
        </div>
        <span className="detail-art-label">意境影像 / 私人游戏档案</span>
      </section>
      <section className="detail-body shell">
        <Reveal className="detail-intro">
          <div>
            <p className="eyebrow">一个值得记住的世界</p>
            <h2>{game.kicker}</h2>
            <p>{game.description}</p>
          </div>
          <dl className="personal-metrics">
            <div>
              <dt>个人评分</dt>
              <dd>
                {game.score}
                <span>/100</span>
              </dd>
            </div>
            <div>
              <dt>游玩时长</dt>
              <dd>
                {game.playtime}
                <span>小时</span>
              </dd>
            </div>
          </dl>
        </Reveal>
        <Reveal className="gallery-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">把目光，再停留片刻</p>
              <h2>沿途影像。</h2>
            </div>
            <span className="small-note">
              {game.provider === "local"
                ? "意境摄影 · 非游戏实机截图"
                : "来自这个世界"}
            </span>
          </div>
          <div className="gallery-grid">
            {game.screenshots.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => setSlide(i)}
                aria-label={`放大第 ${i + 1} 张图片`}
              >
                <Artwork
                  src={src}
                  alt={`《${game.title}》意境影像，第 ${i + 1} 张`}
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
                <p className="eyebrow">有些感受，只有你知道</p>
                <h2>留几句，给记忆。</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setEditing(true)}
                aria-label="编辑笔记"
              >
                <Pencil size={18} />
              </button>
            </div>
            <blockquote>
              {game.notes || "每个世界，都会留下些什么。这一程，你想记住什么？"}
            </blockquote>
            <span className="journal-caption">
              {game.notes ? "摘自你的游玩手记" : "你的故事，仍在续写"}
            </span>
          </Reveal>
          <Reveal className="detail-dates">
            <p className="eyebrow">我的旅程</p>
            <dl>
              <div>
                <dt>首次游玩</dt>
                <dd>{displayDate(game.firstPlayedAt)}</dd>
              </div>
              <div>
                <dt>最近游玩</dt>
                <dd>{displayDate(game.lastPlayedAt)}</dd>
              </div>
              <div>
                <dt>通关日期</dt>
                <dd>{displayDate(game.completedAt)}</dd>
              </div>
            </dl>
            <p className="eyebrow">所属合集</p>
            <div className="collection-tags">
              {game.collections.length ? (
                game.collections.map((c) => (
                  <a
                    key={c}
                    href={`#/library?collection=${encodeURIComponent(c)}`}
                  >
                    {collectionLabel(c)}
                    <ArrowRight size={14} />
                  </a>
                ))
              ) : (
                <button className="text-link" onClick={() => setEditing(true)}>
                  加入合集 <Plus size={15} />
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>
      {editing && (
        <Modal
          title={`编辑《${game.title}》的记录`}
          onClose={() => setEditing(false)}
          className="edit-modal"
        >
          <p className="eyebrow">我的游戏档案</p>
          <h2>写下你的这一程。</h2>
          <p className="modal-subtitle">{game.title} · 保存在此设备</p>
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
                ).setCustomValidity("首次游玩日期不能晚于最近游玩或通关日期。");
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
                  .split(/[,，]/)
                  .map((s) => collectionKey(s.trim()))
                  .filter(Boolean),
              });
              setEditing(false);
            }}
          >
            <div className="form-grid">
              <label>
                游玩状态
                <select
                  aria-label="游玩状态"
                  name="status"
                  defaultValue={game.status}
                  data-autofocus
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                个人评分（满分 100）
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
                游玩时长（小时）
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
                首次游玩
                <input
                  type="date"
                  name="firstPlayedAt"
                  defaultValue={game.firstPlayedAt}
                  onChange={(e) => e.currentTarget.setCustomValidity("")}
                />
              </label>
              <label>
                最近游玩
                <input
                  type="date"
                  name="lastPlayedAt"
                  defaultValue={game.lastPlayedAt}
                />
              </label>
              <label>
                通关日期
                <input
                  type="date"
                  name="completedAt"
                  defaultValue={game.completedAt}
                />
              </label>
            </div>
            <label>
              合集 <span>多个合集用逗号分隔</span>
              <input
                name="collections"
                defaultValue={game.collections.map(collectionLabel).join("，")}
                maxLength={1600}
                placeholder="安静的周末，长久的偏爱"
              />
            </label>
            <label>
              游玩笔记
              <textarea
                name="notes"
                rows={4}
                maxLength={10000}
                defaultValue={game.notes}
                placeholder="一瞬心动，一段回忆，一个重返的理由……"
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                className="text-link"
                onClick={() => setEditing(false)}
              >
                取消
              </button>
              <button className="button dark" type="submit">
                保存记录 <Check size={17} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {slide !== null && (
        <Modal
          title={`第 ${slide + 1} 张图片，共 ${game.screenshots.length} 张`}
          onClose={() => setSlide(null)}
          className="lightbox"
        >
          <Artwork
            src={game.screenshots[slide]}
            eager
            alt={`《${game.title}》第 ${slide + 1} 张图片`}
          />
          <div className="lightbox-controls">
            <button
              className="icon-button"
              aria-label="上一张图片"
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
              aria-label="下一张图片"
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
