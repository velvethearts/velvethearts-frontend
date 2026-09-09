import React from "react";
import { Camera, Sparkle } from "@phosphor-icons/react";

/**
 * ProfileStrengthWidget
 * Shows a gamified profile completion meter on the Profile page.
 * Guides users with slot-by-slot photo category prompts and tracks completeness.
 *
 * Props:
 *  - photoCount: number (0-6)
 *  - hasVoiceIntro: boolean
 *  - hasStory: boolean
 *  - hasVerification: boolean
 *  - onAddPhoto: () => void  — triggers photo picker / edit profile navigation
 *  - onAddVoice: () => void
 */
export const ProfileStrengthWidget = ({
  photoCount = 1,
  hasVoiceIntro = false,
  hasStory = false,
  hasVerification = false,
  onAddPhoto,
  onAddVoice,
}) => {
  // Define milestone tasks
  const tasks = [
    { id: "photo2", done: photoCount >= 2, label: "Add your hobby/activity photo", icon: "🎸", action: onAddPhoto, impact: "+60% more views" },
    { id: "photo3", done: photoCount >= 3, label: "Add a travel or adventure photo", icon: "🌍", action: onAddPhoto, impact: "+80% more replies" },
    { id: "photo4", done: photoCount >= 4, label: "Add a candid or group moment", icon: "😄", action: onAddPhoto, impact: "4.2× more interactions" },
    { id: "voice", done: hasVoiceIntro, label: "Record a 30-sec voice intro", icon: "🎙️", action: onAddVoice, impact: "3× profile visits" },
    { id: "photo5", done: photoCount >= 5, label: "Add a dressed-up photo", icon: "✨", action: onAddPhoto, impact: "Stand out in feed" },
    { id: "verify", done: hasVerification, label: "Get your Verified Rosette badge", icon: "✅", action: null, impact: "+92% trust signals" },
  ];

  const completedCount = tasks.filter((t) => t.done).length;
  // Base: photo1 + hasStory already done = 2 points. Max = 2 + tasks.length
  const totalPoints = 2 + tasks.length;
  const earned = 2 + completedCount; // at least photo1 & story
  const pct = Math.round((earned / totalPoints) * 100);

  const nextTask = tasks.find((t) => !t.done);
  if (!nextTask && photoCount >= 5 && hasVoiceIntro && hasVerification) return null; // fully complete

  const strengthLabel =
    pct < 40 ? "Getting Started" :
    pct < 65 ? "Growing Profile" :
    pct < 85 ? "Strong Profile" : "All-Star Profile";

  const strengthColor =
    pct < 40 ? "#D4AD6A" :
    pct < 65 ? "#B8436A" :
    pct < 85 ? "#6BCB77" : "#22C55E";

  // Tier badge
  const tier = pct < 40 ? "🥉" : pct < 65 ? "🥈" : pct < 85 ? "🥇" : "💎";

  return (
    <div className="psw-root font-ui">
      {/* Header row */}
      <div className="psw-header">
        <div className="psw-title-row">
          <span className="psw-tier">{tier}</span>
          <div>
            <p className="psw-title">Profile Strength</p>
            <p className="psw-label" style={{ color: strengthColor }}>{strengthLabel}</p>
          </div>
          <span className="psw-pct" style={{ color: strengthColor }}>{pct}%</span>
        </div>
        {/* Progress bar */}
        <div className="psw-bar-track">
          <div
            className="psw-bar-fill"
            style={{ width: `${pct}%`, background: strengthColor }}
          />
        </div>
        {nextTask && (
          <p className="psw-impact font-body">
            <Sparkle size={12} weight="fill" style={{ color: strengthColor, verticalAlign: "middle" }} />{" "}
            Next unlock: <strong>{nextTask.impact}</strong>
          </p>
        )}
      </div>

      {/* Task list — show only incomplete tasks (max 3) */}
      <div className="psw-tasks">
        {tasks.filter((t) => !t.done).slice(0, 3).map((task) => (
          <button
            key={task.id}
            className="psw-task-btn"
            onClick={task.action}
            type="button"
          >
            <span className="psw-task-icon">{task.icon}</span>
            <div className="psw-task-body">
              <span className="psw-task-label">{task.label}</span>
              <span className="psw-task-impact">{task.impact}</span>
            </div>
            <div className="psw-task-arrow">
              <Camera size={16} />
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .psw-root{background:var(--bg-surface,#fff);border:1.5px solid var(--border-subtle,rgba(0,0,0,.07));border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:14px;margin-bottom:16px}
        [data-theme="dark"] .psw-root{background:var(--bg-surface-elevated,rgba(255,255,255,.05));border-color:rgba(255,255,255,.1)}
        .psw-header{display:flex;flex-direction:column;gap:10px}
        .psw-title-row{display:flex;align-items:center;gap:10px}
        .psw-tier{font-size:1.4rem;line-height:1}
        .psw-title{font-size:12px;color:var(--text-muted,#8a7a82);text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin:0}
        .psw-label{font-size:14px;font-weight:700;margin:2px 0 0}
        .psw-pct{font-size:1.4rem;font-weight:800;margin-left:auto;line-height:1}
        .psw-bar-track{height:6px;background:var(--charcoal-200,#e8e0e4);border-radius:100px;overflow:hidden}
        .psw-bar-fill{height:100%;border-radius:100px;transition:width .6s cubic-bezier(.34,1.56,.64,1)}
        .psw-impact{font-size:11.5px;color:var(--text-secondary,#5c4a52);margin:0}
        [data-theme="dark"] .psw-impact{color:var(--charcoal-300,#c0bfbe)}
        .psw-tasks{display:flex;flex-direction:column;gap:8px}
        .psw-task-btn{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-surface-warm,#F8F5F2);border:1.5px solid var(--border-default,rgba(0,0,0,.1));border-radius:12px;cursor:pointer;text-align:left;transition:all .2s;width:100%}
        [data-theme="dark"] .psw-task-btn{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1)}
        .psw-task-btn:hover{border-color:var(--burgundy-400,#B8436A);background:var(--burgundy-50,#FFF0F4);transform:translateX(2px)}
        [data-theme="dark"] .psw-task-btn:hover{background:rgba(184,67,106,.12)}
        .psw-task-icon{font-size:1.2rem;line-height:1;flex-shrink:0}
        .psw-task-body{flex:1;display:flex;flex-direction:column;gap:1px}
        .psw-task-label{font-size:13px;font-weight:600;color:var(--text-primary,#1a0a10)}
        [data-theme="dark"] .psw-task-label{color:var(--cream-100,#F9F0EC)}
        .psw-task-impact{font-size:11px;color:var(--burgundy-500,#B8436A);font-weight:600}
        .psw-task-arrow{color:var(--text-muted,#8a7a82);flex-shrink:0}
      `}</style>
    </div>
  );
};
