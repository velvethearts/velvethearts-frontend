import {
  Camera,
  Sparkle,
  Medal,
  Trophy,
  Crown,
  Guitar,
  Globe,
  Smiley,
  Microphone,
  ShieldCheck,
} from "@phosphor-icons/react";

/**
 * ProfileStrengthWidget
 * Shows a gamified profile completion meter on the Profile page.
 * Guides users with slot-by-slot photo category prompts and tracks completeness.
 *
 * Props:
 *  - photoCount: number (0-6)
 *  - hasVoiceIntro: boolean
 *  - hasVerification: boolean
 *  - onAddPhoto: () => void  — triggers photo picker / edit profile navigation
 *  - onAddVoice: () => void
 */
export const ProfileStrengthWidget = ({
  photoCount = 1,
  hasVoiceIntro = false,
  hasVerification = false,
  onAddPhoto,
  onAddVoice,
}) => {
  // Define milestone tasks with Phosphor icons instead of emojis
  const tasks = [
    { id: "photo2", done: photoCount >= 2, label: "Add your hobby/activity photo", icon: Guitar, action: onAddPhoto, impact: "+60% more views" },
    { id: "photo3", done: photoCount >= 3, label: "Add a travel or adventure photo", icon: Globe, action: onAddPhoto, impact: "+80% more replies" },
    { id: "photo4", done: photoCount >= 4, label: "Add a candid moment", icon: Smiley, action: onAddPhoto, impact: "4.2× more interactions" },
    { id: "voice", done: hasVoiceIntro, label: "Record a 30-sec voice intro", icon: Microphone, action: onAddVoice, impact: "3× profile visits" },
    { id: "photo5", done: photoCount >= 5, label: "Add a dressed-up photo", icon: Sparkle, action: onAddPhoto, impact: "Stand out in feed" },
    { id: "verify", done: hasVerification, label: "Get your Verified Rosette badge", icon: ShieldCheck, action: null, impact: "+92% trust signals" },
  ];

  const completedCount = tasks.filter((t) => t.done).length;
  const totalPoints = 2 + tasks.length;
  const earned = 2 + completedCount;
  const pct = Math.round((earned / totalPoints) * 100);

  const nextTask = tasks.find((t) => !t.done);
  if (!nextTask && photoCount >= 5 && hasVoiceIntro && hasVerification) return null;

  const strengthLabel =
    pct < 40 ? "Getting Started" :
      pct < 65 ? "Growing Profile" :
        pct < 85 ? "Strong Profile" : "All-Star Profile";

  // Tier mapped to CSS data attribute — no hardcoded colours in JS
  const tier =
    pct < 40 ? "bronze" :
      pct < 65 ? "silver" :
        pct < 85 ? "gold" : "diamond";

  const TierIcon = {
    bronze: Medal,
    silver: Medal,
    gold: Trophy,
    diamond: Crown,
  }[tier] || Medal;

  return (
    <div className="psw-root font-ui" data-tier={tier}>
      {/* Header row */}
      <div className="psw-header">
        <div className="psw-title-row">
          <span className="psw-tier">
            <TierIcon size={20} weight="fill" />
          </span>
          <div>
            <p className="psw-title">Profile Strength</p>
            <p className="psw-label">{strengthLabel}</p>
          </div>
          <span className="psw-pct">{pct}%</span>
        </div>
        {/* Progress bar — always uses app's burgundy→gold gradient */}
        <div className="psw-bar-track">
          <div className="psw-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        {nextTask && (
          <p className="psw-impact font-body">
            <Sparkle size={12} weight="fill" className="psw-sparkle" />{" "}
            Next unlock: <strong>{nextTask.impact}</strong>
          </p>
        )}
      </div>

      {/* Task list — show only incomplete tasks (max 3) */}
      <div className="psw-tasks">
        {tasks.filter((t) => !t.done).slice(0, 3).map((task) => {
          const TaskIcon = task.icon;
          return (
            <button
              key={task.id}
              className="psw-task-btn"
              onClick={task.action}
              type="button"
            >
              <span className="psw-task-icon">
                <TaskIcon size={18} weight="bold" />
              </span>
              <div className="psw-task-body">
                <span className="psw-task-label">{task.label}</span>
                <span className="psw-task-impact">{task.impact}</span>
              </div>
              <div className="psw-task-arrow">
                {task.id === "voice" ? <Microphone size={16} /> : <Camera size={16} />}
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        /* ── Root card — mirrors you-tile-card surface ── */
        .psw-root {
          background: var(--bg-surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: var(--space-4);
        }
        [data-theme="dark"] .psw-root {
          background: var(--bg-surface-raised);
          border-color: var(--border-default);
        }

        /* Tier accent — left border strip using app tokens */
        .psw-root[data-tier="bronze"] { border-left: 3px solid var(--gold-400); }
        .psw-root[data-tier="silver"] { border-left: 3px solid var(--charcoal-400); }
        .psw-root[data-tier="gold"]   { border-left: 3px solid var(--burgundy-500); }
        .psw-root[data-tier="diamond"]{ border-left: 3px solid var(--burgundy-600); }

        /* ── Header ── */
        .psw-header { display: flex; flex-direction: column; gap: 10px; }
        .psw-title-row { display: flex; align-items: center; gap: 10px; }
        .psw-tier {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          background: var(--bg-surface-warm);
          border: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        [data-theme="dark"] .psw-tier {
          background: var(--charcoal-900);
          border-color: var(--border-default);
        }
        .psw-root[data-tier="bronze"] .psw-tier { color: #CD7F32; }
        .psw-root[data-tier="silver"] .psw-tier { color: var(--charcoal-300); }
        .psw-root[data-tier="gold"]   .psw-tier { color: var(--gold-400); }
        .psw-root[data-tier="diamond"] .psw-tier { color: var(--burgundy-500); }

        .psw-title {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: .06em;
          font-weight: 600;
          margin: 0;
        }

        /* Tier label — all tokens, no hex */
        .psw-label { font-size: 14px; font-weight: 700; margin: 2px 0 0; }
        .psw-root[data-tier="bronze"] .psw-label { color: var(--gold-500); }
        .psw-root[data-tier="silver"] .psw-label { color: var(--charcoal-600); }
        .psw-root[data-tier="gold"]   .psw-label { color: var(--burgundy-500); }
        .psw-root[data-tier="diamond"] .psw-label { color: var(--burgundy-600); }
        [data-theme="dark"] .psw-root[data-tier="silver"] .psw-label { color: var(--charcoal-300); }

        /* Percentage — same colour as label */
        .psw-pct { font-size: 1.4rem; font-weight: 800; margin-left: auto; line-height: 1; }
        .psw-root[data-tier="bronze"] .psw-pct { color: var(--gold-500); }
        .psw-root[data-tier="silver"] .psw-pct { color: var(--charcoal-600); }
        .psw-root[data-tier="gold"]   .psw-pct { color: var(--burgundy-500); }
        .psw-root[data-tier="diamond"] .psw-pct { color: var(--burgundy-600); }
        [data-theme="dark"] .psw-root[data-tier="silver"] .psw-pct { color: var(--charcoal-300); }

        /* ── Progress bar — app's signature gradient throughout ── */
        .psw-bar-track {
          height: 6px;
          background: var(--border-subtle);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        [data-theme="dark"] .psw-bar-track { background: var(--charcoal-800); }

        .psw-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          background: linear-gradient(90deg, var(--burgundy-600), var(--gold-400));
          transition: width .6s cubic-bezier(.34, 1.56, .64, 1);
        }

        /* ── Impact hint ── */
        .psw-impact { font-size: 11.5px; color: var(--text-secondary); margin: 0; }
        .psw-sparkle { color: var(--burgundy-500); vertical-align: middle; }
        .psw-impact strong { color: var(--text-primary); }

        /* ── Task buttons — match existing tile-card interaction style ── */
        .psw-tasks { display: flex; flex-direction: column; gap: 8px; }

        .psw-task-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg-surface-warm);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: border-color .2s, background .2s, transform .15s;
          width: 100%;
        }
        [data-theme="dark"] .psw-task-btn {
          background: var(--charcoal-900);
          border-color: var(--border-default);
        }
        .psw-task-btn:hover {
          border-color: var(--burgundy-500);
          background: var(--bg-accent-subtle);
          transform: translateX(2px);
        }
        [data-theme="dark"] .psw-task-btn:hover {
          background: rgba(184,67,106,.1);
          border-color: var(--burgundy-500);
        }
        .psw-task-btn:active { transform: scale(.98); }

        .psw-task-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: rgba(184, 67, 106, 0.08);
          color: var(--burgundy-500);
          flex-shrink: 0;
        }
        [data-theme="dark"] .psw-task-icon {
          background: rgba(230, 168, 82, 0.1);
          color: var(--gold-400);
        }

        .psw-task-body { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .psw-task-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .psw-task-impact { font-size: 11px; color: var(--burgundy-500); font-weight: 600; }
        .psw-task-arrow { color: var(--text-muted); flex-shrink: 0; }
      `}</style>
    </div>
  );
};
