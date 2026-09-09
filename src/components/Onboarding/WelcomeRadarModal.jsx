import React, { useState, useEffect, useRef } from "react";
import { Sparkle, Gift, X } from "@phosphor-icons/react";

/**
 * WelcomeRadarModal — shown immediately after onboarding completes.
 * Phase 1 (2.2s): radar scanning animation showing curating matches.
 * Phase 2: reveal welcome gift + local match count teaser.
 */
export const WelcomeRadarModal = ({
  userName = "",
  userCity = "",
  interests = [],
  localCount = Math.floor(Math.random() * 60) + 80,
  onClose,
}) => {
  const [phase, setPhase] = useState("scanning");
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase("reveal"), 2200);
    return () => clearTimeout(timerRef.current);
  }, []);

  const vibe1 = interests[0] || "meaningful conversations";
  const vibe2 = interests[1] || "shared adventures";
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <div className="wr-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Velvet Hearts">
      <div className={`wr-card ${phase === "reveal" ? "wr-card--reveal" : ""}`}>
        {phase === "scanning" && (
          <div className="wr-scan-wrap">
            <div className="wr-radar">
              <div className="wr-ring wr-ring-1" />
              <div className="wr-ring wr-ring-2" />
              <div className="wr-ring wr-ring-3" />
              <div className="wr-radar-pulse" />
              <div className="wr-dot wr-dot-1">💜</div>
              <div className="wr-dot wr-dot-2">✨</div>
              <div className="wr-dot wr-dot-3">❤️</div>
              <div className="wr-dot wr-dot-4">🌟</div>
            </div>
            <p className="wr-scan-label font-display">
              Curating verified profiles<br />
              {userCity ? `in ${userCity}` : "near you"}…
            </p>
            <p className="wr-scan-sub font-ui">Matching your vibe · {vibe1} · {vibe2}</p>
          </div>
        )}

        {phase === "reveal" && (
          <div className="wr-reveal-wrap page-enter">
            <button className="wr-close-btn" onClick={onClose} aria-label="Close welcome">
              <X size={18} weight="bold" />
            </button>
            <div className="wr-header">
              <span className="wr-emoji-big">💖</span>
              <h2 className="wr-title font-display">Welcome, {firstName}!</h2>
              <p className="wr-subtitle font-ui">
                Connecting you with intentional matches
                {userCity ? ` in ${userCity}` : " near you"} who share your vibe for {vibe1}.
              </p>
            </div>
            <div className="wr-gift-card">
              <div className="wr-gift-left">
                <Gift size={28} weight="fill" className="wr-gift-icon" />
                <div>
                  <p className="wr-gift-title font-ui">🎁 Welcome Perks Unlocked!</p>
                  <p className="wr-gift-desc font-body">
                    You have <strong>1 Free Spotlight Boost</strong> &amp;{" "}
                    <strong>5 Super-Hearts</strong> to make a memorable first impression today.
                  </p>
                </div>
              </div>
            </div>
            <div className="wr-stat-row font-ui">
              <div className="wr-stat">
                <span className="wr-stat-num">100%</span>
                <span className="wr-stat-label">Verified Rosette</span>
              </div>
              <div className="wr-stat-divider" />
              <div className="wr-stat">
                <span className="wr-stat-num">4.2×</span>
                <span className="wr-stat-label">More Replies w/ 3 Photos</span>
              </div>
              <div className="wr-stat-divider" />
              <div className="wr-stat">
                <span className="wr-stat-num">24h</span>
                <span className="wr-stat-label">Avg First Match</span>
              </div>
            </div>
            <button className="wr-cta-btn font-ui" onClick={onClose}>
              <Sparkle size={18} weight="fill" />
              Start Exploring Matches →
            </button>
            <p className="wr-tip font-body">
              💡 <strong>Pro tip:</strong> Adding a hobby photo &amp; voice intro gets you{" "}
              <strong>3× more profile visits</strong>. You can do it anytime from your profile!
            </p>
          </div>
        )}
      </div>
      <style>{`
        .wr-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;animation:wr-fade-in .3s ease}
        @keyframes wr-fade-in{from{opacity:0}to{opacity:1}}
        .wr-card{background:var(--bg-surface,#fff);border-radius:24px;width:100%;max-width:380px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.25);padding:36px 28px 28px;position:relative;animation:wr-slide-up .35s cubic-bezier(.34,1.56,.64,1)}
        @keyframes wr-slide-up{from{transform:translateY(40px) scale(.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
        .wr-scan-wrap{display:flex;flex-direction:column;align-items:center;gap:20px;padding:12px 0}
        .wr-radar{position:relative;width:160px;height:160px;display:flex;align-items:center;justify-content:center}
        .wr-ring{position:absolute;border-radius:50%;border:2px solid var(--burgundy-400,#B8436A);opacity:0;animation:wr-ripple 2s ease-out infinite}
        .wr-ring-1{width:60px;height:60px;animation-delay:0s}
        .wr-ring-2{width:110px;height:110px;animation-delay:.5s}
        .wr-ring-3{width:160px;height:160px;animation-delay:1s}
        @keyframes wr-ripple{0%{opacity:.8;transform:scale(.6)}100%{opacity:0;transform:scale(1)}}
        .wr-radar-pulse{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--burgundy-600,#912B50),var(--burgundy-400,#B8436A));box-shadow:0 0 0 6px rgba(184,67,106,.15);animation:wr-pulse-anim 1.2s ease-in-out infinite alternate;z-index:1}
        @keyframes wr-pulse-anim{from{box-shadow:0 0 0 6px rgba(184,67,106,.15)}to{box-shadow:0 0 0 14px rgba(184,67,106,.05)}}
        .wr-dot{position:absolute;font-size:18px;animation:wr-orbit 3s linear infinite}
        .wr-dot-1{animation-delay:0s}.wr-dot-2{animation-delay:.75s}.wr-dot-3{animation-delay:1.5s}.wr-dot-4{animation-delay:2.25s}
        @keyframes wr-orbit{0%{transform:rotate(0deg) translateX(58px) rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:rotate(360deg) translateX(58px) rotate(-360deg);opacity:0}}
        .wr-scan-label{font-size:1.1rem;color:var(--text-primary,#1a0a10);text-align:center;line-height:1.4;font-weight:700;margin:0}
        [data-theme="dark"] .wr-scan-label{color:var(--cream-100,#F9F0EC)}
        .wr-scan-sub{font-size:12px;color:var(--text-muted,#8a7a82);text-align:center;letter-spacing:.02em;margin:0}
        .wr-reveal-wrap{display:flex;flex-direction:column;gap:18px}
        .wr-close-btn{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:var(--bg-surface-warm,#F8F5F2);border:1px solid var(--border-subtle,rgba(0,0,0,.08));display:flex;align-items:center;justify-content:center;color:var(--text-muted,#8a7a82);cursor:pointer;transition:all .2s}
        .wr-close-btn:hover{background:var(--burgundy-50,#FFF0F4);color:var(--burgundy-600,#912B50)}
        .wr-header{text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}
        .wr-emoji-big{font-size:2.5rem;line-height:1;animation:wr-pop .5s cubic-bezier(.34,1.56,.64,1)}
        @keyframes wr-pop{from{transform:scale(0)}to{transform:scale(1)}}
        .wr-title{font-size:1.5rem;color:var(--burgundy-900,#3D0A1E);margin:0}
        [data-theme="dark"] .wr-title{color:var(--cream-100,#F9F0EC)}
        .wr-subtitle{font-size:13.5px;color:var(--text-secondary,#5c4a52);line-height:1.5;max-width:280px;margin:0}
        [data-theme="dark"] .wr-subtitle{color:var(--charcoal-300,#c0bfbe)}
        .wr-gift-card{background:linear-gradient(135deg,rgba(184,67,106,.08),rgba(212,173,106,.08));border:1.5px solid rgba(184,67,106,.2);border-radius:14px;padding:14px 16px}
        .wr-gift-left{display:flex;align-items:flex-start;gap:12px}
        .wr-gift-icon{color:var(--burgundy-500,#B8436A);flex-shrink:0;margin-top:2px}
        .wr-gift-title{font-size:13px;font-weight:700;color:var(--text-primary,#1a0a10);margin:0 0 4px}
        [data-theme="dark"] .wr-gift-title{color:var(--cream-100,#F9F0EC)}
        .wr-gift-desc{font-size:12.5px;color:var(--text-secondary,#5c4a52);line-height:1.5;margin:0}
        [data-theme="dark"] .wr-gift-desc{color:var(--charcoal-300,#c0bfbe)}
        .wr-stat-row{display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface-warm,#F8F5F2);border-radius:12px;padding:12px 16px}
        [data-theme="dark"] .wr-stat-row{background:rgba(255,255,255,.04)}
        .wr-stat{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1}
        .wr-stat-num{font-size:1.1rem;font-weight:800;color:var(--burgundy-600,#912B50)}
        .wr-stat-label{font-size:10px;color:var(--text-muted,#8a7a82);text-align:center;line-height:1.3}
        .wr-stat-divider{width:1px;height:32px;background:var(--border-subtle,rgba(0,0,0,.08))}
        .wr-cta-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 20px;background:linear-gradient(135deg,var(--burgundy-600,#912B50),var(--burgundy-500,#B8436A));color:#fff;border:none;border-radius:50px;font-size:15px;font-weight:700;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 6px 20px rgba(184,67,106,.35)}
        .wr-cta-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(184,67,106,.45)}
        .wr-cta-btn:active{transform:scale(.98)}
        .wr-tip{font-size:12px;color:var(--text-muted,#8a7a82);text-align:center;line-height:1.5;padding:0 4px;margin:0}
        [data-theme="dark"] .wr-tip{color:var(--charcoal-400,#9a9999)}
      `}</style>
    </div>
  );
};
