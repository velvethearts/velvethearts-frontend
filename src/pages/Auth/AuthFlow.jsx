import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ShieldCheck, GoogleLogo } from '@phosphor-icons/react';
import { Button } from '../../components/UI/Button';
import { signInWithGoogle } from '../../lib/firebase';
import logo from "../../assets/velvet-heart-logo.png";


export const AuthFlow = ({ onBack }) => {
  const { login } = useApp();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Development bypass helpers
  
  const handleGoogleAuth = async () => {
  setError("");
  setLoading(true);

  try {
    const authRes = await signInWithGoogle();
    await login(authRes?.user?.phoneNumber || '', authRes?.idToken);
  } catch (err) {
    console.error("Google Auth error:", err);
    setError(
      err?.message ||
      "Google Authentication failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

return (
  <div className="auth-page page-enter">
    <div className="auth-card">
      <button
        onClick={onBack}
        className="back-arrow-btn"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

     <div className="auth-logo">
        <img
          src={logo}
          alt="Velvet Hearts"
          className="auth-logo-image"
        />
      </div>

      <div className="auth-step-container page-enter text-center-waiting">
        <h2 className="auth-title font-display">
          Welcome to Velvet Hearts
        </h2>

        <p
          className="auth-subtitle font-body"
          style={{ marginBottom: "2rem" }}
        >
          Find meaningful relationships in a safe and verified community.
          Continue with your Google account to get started.
        </p>

        {error && (
          <div
            className="error-message font-ui"
            role="alert"
            style={{ marginBottom: "1.5rem" }}
          >
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleAuth}
          variant="primary"
          loading={loading}
          className="google-auth-btn font-ui"
        >
          <GoogleLogo size={20} weight="bold" />
          <span>Continue with Google</span>
        </Button>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            color: "rgba(255,255,255,.7)",
            fontSize: ".95rem",
          }}
        >
          <div>✓ Verified Profiles</div>
          <div>✓ Safe Community</div>
          <div>✓ Secure Conversations</div>
        </div>
      </div>


      <div className="auth-legal font-ui">
        By continuing, you agree to our{" "}
        <a
          href="#terms"
          onClick={(e) => e.preventDefault()}
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#privacy"
          onClick={(e) => e.preventDefault()}
        >
          Privacy Policy
        </a>.
      </div>

      <style>{`
        .auth-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6) var(--space-4);
          background: linear-gradient(135deg, var(--burgundy-950) 0%, var(--charcoal-950) 60%, var(--burgundy-900) 100%);
          position: relative;
          overflow: hidden;
        }

        .auth-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 20%, rgba(184, 67, 106, 0.15) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 80%, rgba(196, 150, 74, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-xl);
          padding: var(--space-10) var(--space-8);
          width: 100%;
          max-width: 440px;
          position: relative;
          box-shadow: var(--shadow-xl), 0 0 60px rgba(184, 67, 106, 0.1);
        }

        .back-arrow-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          color: rgba(255,255,255,0.6);
          font-family: var(--font-ui);
          font-size: var(--text-body-sm);
          font-weight: 500;
          transition: color var(--duration-fast);
          margin-bottom: var(--space-6);
        }

        .back-arrow-btn:hover {
          color: rgba(255,255,255,0.9);
        }

       .auth-logo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 12px;  
        }
        
        .auth-logo-image {
          width: 150px;
          height: 150px;
          object-fit: contain;
        }

        .auth-step-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .auth-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          color: #FFFFFF;
          text-align: center;
          line-height: var(--leading-tight);
        }

        .auth-subtitle {
          font-size: var(--text-body-sm);
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          line-height: var(--leading-normal);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        /* Phone input group */
        .phone-input-group {
          display: flex;
          gap: var(--space-2);
        }

        .country-selector-wrap {
          flex-shrink: 0;
        }

        .country-select {
          height: 100%;
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-md);
          background-color: rgba(255,255,255,0.06);
          color: #FFFFFF;
          padding: 0 var(--space-2);
          font-size: var(--text-body-sm);
          outline: none;
          cursor: pointer;
          transition: border-color var(--duration-fast);
          min-width: 88px;
        }

        .country-select option {
          background-color: var(--charcoal-900);
          color: #FFFFFF;
        }

        .country-select:focus {
          border-color: var(--burgundy-400);
        }

        .phone-input-wrap {
          flex: 1;
        }

        .phone-input {
          width: 100%;
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          background-color: rgba(255,255,255,0.06);
          color: #FFFFFF;
          outline: none;
          transition: all var(--duration-fast);
        }

        .phone-input::placeholder {
          color: rgba(255,255,255,0.35);
        }

        .phone-input:focus {
          border-color: var(--burgundy-400);
          background-color: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(184, 67, 106, 0.2);
        }

        /* Error */
        .error-message {
          background-color: rgba(196, 90, 90, 0.15);
          border: 1px solid rgba(196, 90, 90, 0.4);
          color: #FFB3B3;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-body-sm);
          text-align: center;
        }

        /* Submit button override for auth dark bg */
        .auth-submit-btn {
          width: 100%;
          padding: var(--space-4) var(--space-6) !important;
          font-size: var(--text-body) !important;
          background: linear-gradient(135deg, var(--burgundy-600), var(--burgundy-400)) !important;
          border: none !important;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--burgundy-500), var(--burgundy-300)) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(184,67,106,0.35) !important;
        }

        /* Legal text */
        .auth-legal {
          margin-top: var(--space-5);
          font-size: var(--text-caption);
          color: rgba(255,255,255,0.35);
          text-align: center;
          line-height: var(--leading-relaxed);
        }

        .auth-legal a {
          color: rgba(255,255,255,0.6);
          text-decoration: underline;
          transition: color var(--duration-fast);
        }

        .auth-legal a:hover {
          color: var(--burgundy-300);
        }

        /* Waiting Screen Styling */
        .text-center-waiting {
          text-align: center;
        }

        .waiting-illustration-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-6);
          width: 100px;
          height: 100px;
        }

        .waiting-icon-shield {
          color: var(--gold-400, #D4AD6A);
          z-index: 2;
          filter: drop-shadow(0 0 10px rgba(212, 173, 106, 0.4));
          animation: pulseIcon 3s infinite ease-in-out;
        }

        .waiting-icon-bg-glow {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 173, 106, 0.2) 0%, transparent 70%);
          z-index: 1;
        }

        .waiting-message-box {
          color: rgba(255, 255, 255, 0.85);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-6);
        }

        .waiting-thankyou {
          font-weight: bold;
          font-size: var(--text-body-lg);
          color: #FFFFFF;
        }

        .waiting-note {
          font-size: var(--text-body-sm);
          color: rgba(255, 255, 255, 0.6);
        }

        @keyframes pulseIcon {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Tabs Styling */
        .auth-tabs {
          display: flex;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.1);
          margin-bottom: var(--space-6);
        }

        .auth-tab {
          flex: 1;
          text-align: center;
          padding: var(--space-3) 0;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 600;
          font-size: var(--text-body-sm);
          cursor: pointer;
          transition: all var(--duration-fast);
          position: relative;
        }

        .auth-tab:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .auth-tab.active {
          color: #FFFFFF;
        }

        .auth-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1.5px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--burgundy-400);
        }

        /* Google button */
        .google-auth-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          background-color: #FFFFFF !important;
          color: var(--charcoal-900) !important;
          border: 1px solid var(--border-default) !important;
          font-weight: 600;
          padding: var(--space-3) var(--space-6) !important;
          transition: all var(--duration-fast) !important;
        }

        .google-auth-btn:hover:not(:disabled) {
          background-color: #F8F9FA !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>
      </div>
    </div>
  );
};