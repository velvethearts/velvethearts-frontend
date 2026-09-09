import React, { useState } from "react";
import { Camera, X, Sparkle } from "@phosphor-icons/react";

/**
 * PhotoVibeBanner
 * Dismissible in-feed interstitial for users with fewer than 3 photos.
 * Injected between profile cards in gallery-wall-grid view.
 */
export const PhotoVibeBanner = ({ photoCount = 1, onAddPhoto, onDismiss }) => {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss?.(), 280);
  };

  const remaining = Math.max(0, 3 - photoCount);

  const copy = {
    heading: photoCount === 1
      ? "You're off to a great start! \u2728"
      : "One more photo = 3\u00d7 more replies \ud83d\udcf8",
    body: photoCount === 1
      ? `Profiles with 3+ photos get 4.2\u00d7 more interest requests. Add just ${remaining} more to unlock your full potential.`
      : `You're so close! Adding ${remaining} more photo${remaining > 1 ? "s" : ""} makes you appear more genuine and approachable.`,
    cta: photoCount === 1 ? "Add 2 More Photos \u2192" : "Add a Photo Now \u2192",
  };

  const progressPct = Math.min(100, (photoCount / 3) * 100);

  return (
    <div className={`pvb-root ${exiting ? "pvb-exiting" : ""}`}>
      <button className="pvb-dismiss" onClick={handleDismiss} aria-label="Dismiss">
        <X size={14} weight="bold" />
      </button>
      <div className="pvb-inner">
        <div className="pvb-icon-wrap">
          <Camera size={28} weight="duotone" className="pvb-icon" />
        </div>
        <div className="pvb-body">
          <p className="pvb-heading font-ui">{copy.heading}</p>
          <p className="pvb-text font-body">{copy.body}</p>
          <div className="pvb-progress-wrap">
            <div className="pvb-progress-track">
              <div className="pvb-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="pvb-progress-label font-ui">{photoCount}/3</span>
          </div>
          <button className="pvb-cta font-ui" onClick={onAddPhoto}>
            <Sparkle size={14} weight="fill" />
            {copy.cta}
          </button>
        </div>
      </div>
      <style>{`
        .pvb-root{grid-column:1/-1;background:linear-gradient(135deg,rgba(184,67,106,.07) 0%,rgba(212,173,106,.06) 100%);border:1.5px solid rgba(184,67,106,.2);border-radius:16px;padding:14px 16px;position:relative;animation:pvb-in .4s cubic-bezier(.34,1.56,.64,1);overflow:hidden}
        [data-theme="dark"] .pvb-root{background:linear-gradient(135deg,rgba(184,67,106,.12) 0%,rgba(212,173,106,.08) 100%);border-color:rgba(184,67,106,.28)}
        .pvb-root::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--burgundy-600,#912B50),var(--gold-400,#D4AD6A))}
        @keyframes pvb-in{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .pvb-exiting{animation:pvb-out .28s ease forwards !important}
        @keyframes pvb-out{to{opacity:0;transform:scale(.94);max-height:0;padding:0;margin:0}}
        .pvb-dismiss{position:absolute;top:10px;right:10px;width:24px;height:24px;border-radius:50%;background:var(--bg-surface-warm,#F8F5F2);border:1px solid var(--border-subtle,rgba(0,0,0,.08));display:flex;align-items:center;justify-content:center;color:var(--text-muted,#8a7a82);cursor:pointer;transition:all .2s}
        .pvb-dismiss:hover{background:var(--burgundy-50,#FFF0F4);color:var(--burgundy-600,#912B50)}
        .pvb-inner{display:flex;align-items:flex-start;gap:12px;padding-right:24px}
        .pvb-icon-wrap{width:44px;height:44px;border-radius:12px;background:rgba(184,67,106,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .pvb-icon{color:var(--burgundy-500,#B8436A)}
        .pvb-body{flex:1;display:flex;flex-direction:column;gap:6px}
        .pvb-heading{font-size:13.5px;font-weight:700;color:var(--text-primary,#1a0a10);margin:0}
        [data-theme="dark"] .pvb-heading{color:var(--cream-100,#F9F0EC)}
        .pvb-text{font-size:12px;color:var(--text-secondary,#5c4a52);line-height:1.5;margin:0}
        [data-theme="dark"] .pvb-text{color:var(--charcoal-300,#c0bfbe)}
        .pvb-progress-wrap{display:flex;align-items:center;gap:8px;margin-top:2px}
        .pvb-progress-track{flex:1;height:4px;background:var(--charcoal-200,#e8e0e4);border-radius:100px;overflow:hidden}
        [data-theme="dark"] .pvb-progress-track{background:rgba(255,255,255,.1)}
        .pvb-progress-fill{height:100%;background:linear-gradient(90deg,var(--burgundy-600,#912B50),var(--gold-400,#D4AD6A));border-radius:100px;transition:width .6s ease}
        .pvb-progress-label{font-size:10px;font-weight:700;color:var(--burgundy-600,#912B50);white-space:nowrap}
        .pvb-cta{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;background:var(--burgundy-600,#912B50);color:#fff;border:none;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;width:fit-content;transition:transform .15s,background .15s}
        .pvb-cta:hover{background:var(--burgundy-500,#B8436A);transform:translateY(-1px)}
        .pvb-cta:active{transform:scale(.97)}
      `}</style>
    </div>
  );
};
