import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { HuntController, HuntSnapshot } from "../night-hunt/types";
import "../night-hunt/night-hunt.css";

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
const initial: HuntSnapshot = {
  mode: "playing",
  health: 100,
  stamina: 100,
  bossHealth: 5400,
  bossMaxHealth: 5400,
  posture: 0,
  phase: 1,
  elapsed: 0,
  deaths: 0,
  hits: 0,
  parries: 0,
  perfectDodges: 0,
  message: "",
  muted: false,
};

function Controls({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`hunt-instructions ${compact ? "compact" : ""}`}>
      <span>
        <kbd>W A S D</kbd> 移动
      </span>
      <span>
        <kbd>鼠标左键</kbd> 挥刃
      </span>
      <span>
        <kbd>空格</kbd> 闪避
      </span>
      <span>
        <kbd>E / 右键</kbd> 弹反
      </span>
      {!compact && (
        <span>
          <kbd>ESC</kbd> 暂停
        </span>
      )}
    </div>
  );
}

function TouchControls({
  controller,
}: {
  controller: React.RefObject<HuntController | null>;
}) {
  const stick = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });
  const pointer = useRef<number | null>(null);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== e.pointerId || !stick.current) return;
    const rect = stick.current.getBoundingClientRect();
    let x = (e.clientX - rect.left - rect.width / 2) / 34;
    let y = (e.clientY - rect.top - rect.height / 2) / 34;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    setThumb({ x, y });
    controller.current?.move(x, y);
  };
  const release = () => {
    pointer.current = null;
    setThumb({ x: 0, y: 0 });
    controller.current?.move(0, 0);
  };
  useEffect(() => release, []);
  return (
    <div className="hunt-touch">
      <div
        className="hunt-stick"
        ref={stick}
        role="group"
        aria-label="触控移动摇杆"
        onPointerDown={(e) => {
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span
          style={{
            transform: `translate(${thumb.x * 30}px, ${thumb.y * 30}px)`,
          }}
        />
      </div>
      <div className="hunt-touch-actions">
        {(
          [
            ["parry", "弹反"],
            ["dodge", "闪避"],
            ["attack", "挥刃"],
          ] as const
        ).map(([action, label]) => (
          <button
            key={action}
            className={`touch-${action}`}
            aria-label={label}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              controller.current?.input(action, true);
            }}
            onPointerUp={() => controller.current?.input(action, false)}
            onPointerCancel={() => controller.current?.input(action, false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NightHunt() {
  const page = useRef<HTMLDivElement>(null),
    host = useRef<HTMLDivElement>(null),
    controller = useRef<HuntController | null>(null);
  const [active, setActive] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<HuntSnapshot>(initial),
    [muted, setMuted] = useState(false),
    [fullscreen, setFullscreen] = useState(false);
  const state = useRef(snapshot),
    mute = useRef(muted),
    dialog = useRef<HTMLDivElement>(null);
  state.current = snapshot;
  mute.current = muted;

  useEffect(() => {
    if (!active || !host.current) return;
    let disposed = false;
    let instance: HuntController | null = null;
    setLoading(true);
    setError("");
    setSnapshot(initial);
    import("../night-hunt/createGame")
      .then(({ default: createHuntGame }) =>
        disposed
          ? null
          : createHuntGame(host.current!, {
              reducedMotion: matchMedia("(prefers-reduced-motion: reduce)")
                .matches,
              muted: mute.current,
              onSnapshot: (value) => {
                if (!disposed) setSnapshot(value);
              },
            }),
      )
      .then((game) => {
        if (!game) return;
        instance = game;
        if (disposed) {
          game.destroy();
          return;
        }
        controller.current = game;
        game.setMuted(mute.current);
        setLoading(false);
        host.current?.focus({ preventScroll: true });
      })
      .catch((reason) => {
        if (!disposed) {
          console.error("Night Hunt could not start", reason);
          setError("月夜尚未展开，请重新开启狩猎。");
          setLoading(false);
        }
      });
    return () => {
      disposed = true;
      instance?.destroy();
      controller.current = null;
    };
  }, [active]);

  useEffect(() => {
    const changed = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  useEffect(() => {
    if (!active) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (state.current.mode === "playing") controller.current?.pause();
        else if (state.current.mode === "paused") controller.current?.resume();
      }
      if (e.key === "Tab" && dialog.current) {
        const buttons = [
          ...dialog.current.querySelectorAll<HTMLButtonElement>("button"),
        ];
        const first = buttons[0],
          last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement)
      void document.exitFullscreen().catch(() => {});
    else void page.current?.requestFullscreen?.().catch(() => {});
  };
  const start = () => {
    setLoading(true);
    setError("");
    setActive(true);
    if (!document.fullscreenElement)
      void page.current?.requestFullscreen?.().catch(() => {});
  };
  const back = () => {
    setActive(false);
    if (document.fullscreenElement)
      void document.exitFullscreen().catch(() => {});
  };
  const toggleMute = () => {
    setMuted(!muted);
    controller.current?.setMuted(!muted);
  };
  const overlay = snapshot.mode === "paused" || snapshot.mode === "victory";

  return (
    <div
      className={`hunt-page ${active ? "is-playing" : "is-cover"} phase-${snapshot.phase}`}
      ref={page}
    >
      {!active ? (
        <>
          <img
            className="hunt-cover-art"
            src={`${import.meta.env.BASE_URL}night-hunt/cover.svg`}
            alt="线描月夜废墟中，猎人与钟骸巨兽相对而立"
          />
          <div className="hunt-cover-shade" />
          <header className="hunt-cover-header">
            <a href="#/" aria-label="返回 LUMEN">
              <ArrowLeft size={15} /> LUMEN
            </a>
            <span>一段可亲自走入的夜色</span>
            <button
              onClick={toggleMute}
              aria-label={muted ? "开启声音" : "静音"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </header>
          <div className="hunt-cover-copy">
            <p className="hunt-kicker">
              <span /> 月夜 · 废墟 · 最后一猎
            </p>
            <h1>
              <span>NIGHT</span>
              <span>
                HUNT<i>夜猎</i>
              </span>
            </h1>
            <p className="hunt-cover-line">月落之前，直面长夜。</p>
            <p className="hunt-cover-description">
              一位猎人。一座遗忘的钟庭。
              <br />
              只需三招，与最后的守望者交锋。
            </p>
            <button className="hunt-play" onClick={start}>
              <span>PLAY</span>
              <span className="hunt-play-arrow">
                <ArrowRight size={26} strokeWidth={1.4} />
              </span>
            </button>
            <span className="hunt-play-note">
              约 3–6 分钟一局 · 建议佩戴耳机
            </span>
          </div>
          <div className="hunt-cover-footer">
            <Controls />
            <p>
              挥刃有度，闪避有时。
              <br />
              <span>白光可弹反，暗红请闪避。</span>
            </p>
          </div>
          <p className="hunt-mobile-note">支持触控 · 横屏游玩更尽兴</p>
          <span className="hunt-edition">LUMEN ORIGINAL / NO. 01</span>
        </>
      ) : (
        <>
          <div
            ref={host}
            className="hunt-canvas"
            tabIndex={0}
            role="application"
            aria-label="Night Hunt 游戏区域。WASD 移动，鼠标左键挥刃，空格闪避，E 或右键弹反，Escape 暂停。"
          />
          {!loading && !error && (
            <div className={`hunt-hud ${overlay ? "is-dimmed" : ""}`}>
              <div className="hunt-player-hud">
                <div className="hunt-hud-label">
                  <span>猎人</span>
                  <small>{Math.ceil(snapshot.health)} / 100</small>
                </div>
                <div
                  className="hunt-meter health"
                  role="meter"
                  aria-label="生命"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(snapshot.health)}
                >
                  <span style={{ width: `${snapshot.health}%` }} />
                </div>
                <div
                  className="hunt-meter stamina"
                  role="meter"
                  aria-label="精力"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(snapshot.stamina)}
                >
                  <span style={{ width: `${snapshot.stamina}%` }} />
                </div>
                <span className="hunt-stamina-label">精力</span>
              </div>
              <div className="hunt-time">
                <span>{clock(snapshot.elapsed)}</span>
                <small>
                  {snapshot.deaths > 0
                    ? `第 ${snapshot.deaths + 1} 次狩猎`
                    : "长夜初临"}
                </small>
              </div>
              <div className="hunt-game-actions">
                <button
                  aria-label={muted ? "开启声音" : "静音"}
                  onClick={toggleMute}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  aria-label={fullscreen ? "退出全屏" : "进入全屏"}
                  onClick={toggleFullscreen}
                >
                  {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
                <button
                  aria-label="暂停游戏"
                  onClick={() => controller.current?.pause()}
                >
                  <Pause size={18} />
                </button>
              </div>
              <div
                className={`hunt-feedback ${snapshot.mode === "dead" ? "is-dead" : ""}`}
                role="status"
              >
                {snapshot.message}
              </div>
              <div className="hunt-boss-hud">
                <div className="hunt-boss-name">
                  <span>
                    {snapshot.phase === 1 ? "钟骸守望者" : "钟骸守望者 · 血月"}
                  </span>
                  <small>
                    {snapshot.phase === 1 ? "I · 最后的钟声" : "II · 月蚀之怒"}
                  </small>
                </div>
                <div
                  className="hunt-meter boss"
                  role="meter"
                  aria-label="守望者生命"
                  aria-valuemin={0}
                  aria-valuemax={snapshot.bossMaxHealth}
                  aria-valuenow={Math.round(snapshot.bossHealth)}
                >
                  <span
                    style={{
                      width: `${(snapshot.bossHealth / snapshot.bossMaxHealth) * 100}%`,
                    }}
                  />
                </div>
                <div
                  className="hunt-meter posture"
                  role="meter"
                  aria-label="守望者架势"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(snapshot.posture)}
                >
                  <span style={{ width: `${snapshot.posture}%` }} />
                </div>
                <span className="hunt-posture-label">
                  弹反积累架势 · 击破后挥刃处决
                </span>
              </div>
              <div className="hunt-bottom-hints">
                <Controls compact />
                <span>白光弹反 · 暗红闪避</span>
              </div>
              <span className="hunt-rotate-note">横过屏幕，让月夜铺展。</span>
              {snapshot.mode === "playing" && (
                <TouchControls controller={controller} />
              )}
            </div>
          )}
          {loading && (
            <div className="hunt-loading">
              <span className="hunt-moon-loader" />
              <p>夜色正在降临</p>
            </div>
          )}
          {error && (
            <div className="hunt-overlay">
              <p>{error}</p>
              <button className="hunt-primary" onClick={back}>
                返回封面 <ArrowLeft size={16} />
              </button>
            </div>
          )}
          {overlay && !loading && (
            <div
              className="hunt-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="hunt-dialog-title"
              ref={dialog}
            >
              {snapshot.mode === "victory" ? (
                <>
                  <span className="hunt-kicker">THE NIGHT IS YOURS</span>
                  <h2 id="hunt-dialog-title">长夜，终有回响。</h2>
                  <p>钟声沉寂。月光为你留下归途。</p>
                  <div className="hunt-results">
                    <span>
                      <strong>{clock(snapshot.elapsed)}</strong>狩猎用时
                    </span>
                    <span>
                      <strong>{snapshot.parries}</strong>成功弹反
                    </span>
                    <span>
                      <strong>{snapshot.perfectDodges}</strong>完美闪避
                    </span>
                  </div>
                  <button
                    className="hunt-primary"
                    autoFocus
                    onClick={() => controller.current?.restart()}
                  >
                    再赴长夜 <RotateCcw size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="hunt-kicker">A MOMENT IN THE DARK</span>
                  <h2 id="hunt-dialog-title">让月色，停留片刻。</h2>
                  <p>观察起手，留下精力。每次倒下，都是下一次抵达。</p>
                  <Controls />
                  <div className="hunt-pause-tips">
                    <span>
                      <b>挥刃</b>靠近守望者，抓住收招的空隙。
                    </span>
                    <span>
                      <b>闪避</b>在攻击落下的瞬间穿过它，恢复精力。
                    </span>
                    <span>
                      <b>弹反</b>白光落下前按 E，击破架势后追击。
                    </span>
                  </div>
                  <button
                    className="hunt-primary"
                    autoFocus
                    onClick={() => {
                      controller.current?.resume();
                      host.current?.focus();
                    }}
                  >
                    继续狩猎 <Play size={16} />
                  </button>
                  <button
                    className="hunt-text-button"
                    onClick={() => controller.current?.restart()}
                  >
                    <RotateCcw size={14} />
                    重新开始
                  </button>
                </>
              )}
              <button className="hunt-text-button" onClick={back}>
                <X size={14} />
                返回封面
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
